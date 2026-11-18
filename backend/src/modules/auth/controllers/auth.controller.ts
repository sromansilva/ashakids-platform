import type { Request, Response, NextFunction } from 'express';
import * as argon2 from '@node-rs/argon2';
import {
  loginSchema,
  forgotPasswordSchema,
  login2faSchema,
  verify2faSetupSchema,
  disable2faSchema,
} from '../dtos/auth.dto.js';
import { authService } from '../services/auth.service.js';
import { settings } from '../../../core/config.js';
import { getSessionToken } from '../../../core/middleware/auth.middleware.js';
import { GmailService } from '../../../infrastructure/mailer/gmail.service.js';
import { pool } from '../../../core/database.js';
import {
  createResetToken,
  verifyResetToken,
  decodeResetTokenPayload,
} from '../../../core/security/password-reset-token.js';

function setSessionCookie(res: Response, token: string): void {
  res.cookie(settings.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: settings.ENVIRONMENT === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: settings.SESSION_TTL_HOURS * 60 * 60 * 1000,
  });
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);
      if ('requires_2fa' in result && result.requires_2fa) {
        res.json({
          requires_2fa: true,
          mfa_ticket: result.mfa_ticket,
          message: result.message,
          user: result.user,
        });
        return;
      }
      setSessionCookie(res, (result as { token: string }).token);
      res.json({ message: 'Inicio de sesión exitoso', token: (result as { token: string }).token, user: result.user });
    } catch (err) {
      next(err);
    }
  }

  async verify2faLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = login2faSchema.parse(req.body);
      const result = await authService.verify2faLogin(dto.mfa_ticket, dto.code);
      setSessionCookie(res, result.token);
      res.json({ message: 'Inicio de sesión exitoso', token: result.token, user: result.user });
    } catch (err) {
      next(err);
    }
  }

  async get2faStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const result = await authService.get2faStatus(req.user.id_usuario);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async setup2fa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const result = await authService.setup2fa(
        req.user.id_usuario,
        req.user.codigo_usuario || `USR${req.user.id_usuario}`
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async confirm2faSetup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const dto = verify2faSetupSchema.parse(req.body);
      const result = await authService.confirm2faSetup(req.user.id_usuario, dto.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async disable2fa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const dto = disable2faSchema.parse(req.body);
      const result = await authService.disable2fa(req.user.id_usuario, dto.password, dto.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    res.json(req.user);
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.revokeSession(getSessionToken(req));
      res.clearCookie(settings.SESSION_COOKIE_NAME, { path: '/' });
      res.json({ message: 'Sesión cerrada correctamente' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = forgotPasswordSchema.parse(req.body);
      let recipient = (dto.email || '').trim();
      let userFound: { id_usuario: number; codigo_usuario: string; email: string; password_hash: string } | null = null;

      if (recipient) {
        try {
          const userRes = await pool.query(
            `SELECT id_usuario, codigo_usuario, email, password_hash FROM usuarios WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
            [recipient]
          );
          if (userRes.rows.length > 0 && userRes.rows[0]) {
            userFound = userRes.rows[0] as { id_usuario: number; codigo_usuario: string; email: string; password_hash: string };
          }
        } catch (dbErr) {
          console.warn('[AuthController] Error buscando usuario por email:', dbErr);
        }
      } else if (dto.codigo_usuario) {
        try {
          const userRes = await pool.query(
            `SELECT id_usuario, codigo_usuario, email, password_hash FROM usuarios WHERE UPPER(codigo_usuario) = UPPER($1) LIMIT 1;`,
            [dto.codigo_usuario.trim()]
          );
          if (userRes.rows.length > 0 && userRes.rows[0]) {
            const row = userRes.rows[0] as { id_usuario: number; codigo_usuario: string; email: string; password_hash: string };
            userFound = row;
            recipient = row.email;
          }
        } catch (dbErr) {
          console.warn('[AuthController] Error buscando usuario por codigo_usuario:', dbErr);
        }
      }

      let mailStatus = 'NO_CONFIGURADO';
      if (recipient) {
        let targetEmail = recipient;
        if (targetEmail.endsWith('@ashakids.test') && settings.GMAIL_SENDER_EMAIL) {
          targetEmail = settings.GMAIL_SENDER_EMAIL;
        }

        const origin = (settings.PUBLIC_ORIGIN || 'https://ashakids.life').replace(/\/+$/, '');
        let resetUrl = `${origin}/crear-contrasena`;

        if (userFound) {
          const token = createResetToken(userFound.id_usuario, userFound.codigo_usuario, userFound.password_hash);
          resetUrl = `${origin}/crear-contrasena?token=${token}`;
        }

        const mailRes = await GmailService.sendPasswordResetEmail({
          to: targetEmail,
          resetUrl,
        }).catch((e) => {
          console.warn('[AuthController] Error enviando correo de reseteo:', e);
          return null;
        });
        if (mailRes?.status) mailStatus = mailRes.status;
      }

      res.json({
        message: `Si ${dto.email || dto.codigo_usuario} está registrado, recibirá instrucciones de recuperación.`,
        status: mailStatus,
      });
    } catch (err) {
      next(err);
    }
  }

  async createPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.body.token || '').trim();
      const newPassword = (req.body.new_password || req.body.nueva_password || req.body.password || '').trim();

      if (!token) {
        res.status(400).json({ error: 'Token de recuperación no proporcionado.' });
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        return;
      }

      const decoded = decodeResetTokenPayload(token);
      if (!decoded || !decoded.id_usuario) {
        res.status(400).json({ error: 'El formato del enlace de recuperación es inválido.' });
        return;
      }

      const userRes = await pool.query(
        `SELECT id_usuario, codigo_usuario, email, password_hash, activo FROM usuarios WHERE id_usuario = $1;`,
        [decoded.id_usuario]
      );
      if (userRes.rows.length === 0) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
        return;
      }

      const user = userRes.rows[0];
      const verifyResult = verifyResetToken(token, user.password_hash);
      if (!verifyResult.valid) {
        res.status(400).json({ error: verifyResult.error || 'Enlace no válido o expirado.' });
        return;
      }

      // Hash new password with Argon2
      const newHash = await argon2.hash(newPassword, {
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 4,
      });

      await pool.query(
        `UPDATE usuarios
         SET password_hash = $1, password_change_required = false, intentos_fallidos = 0, bloqueado_hasta = NULL
         WHERE id_usuario = $2;`,
        [newHash, user.id_usuario]
      );

      // Revoke past active sessions
      try {
        await pool.query(
          `UPDATE sesiones_autenticacion SET revocado = true, fecha_cierre = NOW() WHERE id_usuario = $1 AND revocado = false;`,
          [user.id_usuario]
        );
      } catch (sessErr) {
        console.warn('[AuthController] Advertencia revocando sesiones antiguas:', sessErr);
      }

      res.json({
        message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.',
        codigo_usuario: user.codigo_usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async resendActivation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawInput = (req.body.codigo_usuario || req.body.email || '').trim();
      if (!rawInput) {
        res.status(400).json({ error: 'Ingresa tu código de usuario o correo.' });
        return;
      }

      const userRes = await pool.query(
        `SELECT id_usuario, codigo_usuario, email, password_hash, nombres, apellidos FROM usuarios
         WHERE (UPPER(codigo_usuario) = UPPER($1) OR LOWER(email) = LOWER($1))
           AND activo = true AND password_change_required = true
         LIMIT 1;`,
        [rawInput]
      );

      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        let targetEmail = user.email;
        if (targetEmail.endsWith('@ashakids.test') && settings.GMAIL_SENDER_EMAIL) {
          targetEmail = settings.GMAIL_SENDER_EMAIL;
        }
        const token = createResetToken(user.id_usuario, user.codigo_usuario, user.password_hash);
        const origin = (settings.PUBLIC_ORIGIN || 'https://ashakids.life').replace(/\/+$/, '');
        const activationUrl = `${origin}/crear-contrasena?token=${encodeURIComponent(token)}`;
        void GmailService.sendAccountActivationEmail({
          to: targetEmail,
          name: `${user.nombres} ${user.apellidos || ''}`.trim(),
          role: 'Familia o terapeuta',
          code: user.codigo_usuario,
          activationUrl,
        }).catch((e) => console.warn('[AuthController] Error reenviando enlace:', e));
      }

      res.json({
        message: 'Si la cuenta está pendiente de activación, enviaremos un enlace a tu correo.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
