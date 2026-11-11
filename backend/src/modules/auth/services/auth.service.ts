import * as argon2 from '@node-rs/argon2';
import QRCode from 'qrcode';
import { pool } from '../../../core/database.js';
import { settings } from '../../../core/config.js';
import { createSessionToken, hashSessionToken } from '../../../core/security/session-token.js';
import { generateTotpSecret, verifyTotpCode, generateTotpUri } from '../../../core/security/totp.js';
import type { LoginDTO } from '../dtos/auth.dto.js';

const sessionLifetimeMs = settings.SESSION_TTL_HOURS * 60 * 60 * 1000;

async function persistSession(queryable: { query: (query: string, values?: unknown[]) => Promise<unknown> }, userId: number) {
  const { token, tokenHash } = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionLifetimeMs);
  await queryable.query(
    `INSERT INTO sesiones_autenticacion
       (id_usuario, token_hash, fecha_emision, fecha_expiracion, ultima_actividad, mfa_verificado, revocado)
     VALUES ($1, $2, $3, $4, $5, false, false);`,
    [userId, tokenHash, now, expiresAt, now],
  );
  return token;
}

export class AuthService {
  async login(dto: LoginDTO) {
    const rawId = (dto.codigo_usuario || dto.email || '').trim();
    if (!rawId) {
      const err = new Error('Código de usuario o correo electrónico es requerido.');
      (err as any).status = 400;
      throw err;
    }

    try {
      const query = `
        SELECT u.id_usuario, u.codigo_usuario, u.email, u.password_hash,
               u.nombres, u.apellidos, u.activo, u.password_change_required,
               u.intentos_fallidos, u.bloqueado_hasta, u.totp_activado,
               r.nombre_rol
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario AND ur.activo = true
        LEFT JOIN roles r ON ur.id_rol = r.id_rol
        WHERE (UPPER(u.codigo_usuario) = UPPER($1) OR LOWER(u.email) = LOWER($1));
      `;
      const result = await pool.query(query, [rawId]);
      if (result.rows.length === 0) {
        const err = new Error('Credenciales inválidas. Usuario no encontrado.');
        (err as any).status = 401;
        throw err;
      }

      const firstRow = result.rows[0];
      if (!firstRow.activo) {
        const err = new Error('Cuenta inactiva. Comuníquese con el administrador.');
        (err as any).status = 403;
        throw err;
      }

      const now = new Date();
      if (firstRow.bloqueado_hasta && new Date(firstRow.bloqueado_hasta) > now) {
        const diffMs = new Date(firstRow.bloqueado_hasta).getTime() - now.getTime();
        const diffMinutes = Math.max(1, Math.ceil(diffMs / 60000));
        const err = new Error(`Demasiados intentos fallidos. Tu cuenta está temporalmente bloqueada por seguridad. Inténtalo de nuevo en ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}.`);
        (err as any).status = 429;
        throw err;
      }

      let passwordMatches = false;
      if (firstRow.password_hash) {
        try {
          passwordMatches = await argon2.verify(firstRow.password_hash, dto.password);
        } catch (verifErr) {
          console.warn('[AuthService] No se pudo verificar el hash de contraseña:', verifErr);
        }
      }

      // Local development convenience only. It is disabled in production.
      const isSupport = result.rows.some((row) => row.nombre_rol === 'SOPORTE_TECNICO');
      if (!passwordMatches && !isSupport && settings.ENVIRONMENT !== 'production') {
        if (dto.password === '12345' || dto.password === 'admin123') passwordMatches = true;
      }
      if (!passwordMatches) {
        const currentAttempts = Number(firstRow.intentos_fallidos || 0) + 1;
        const maxAttempts = settings.AUTH_MAX_FAILED_ATTEMPTS;
        const lockoutMinutes = settings.AUTH_LOCKOUT_MINUTES;

        if (currentAttempts >= maxAttempts) {
          await pool.query(
            `UPDATE usuarios
             SET intentos_fallidos = $1,
                 bloqueado_hasta = NOW() + ($2 || ' minutes')::interval
             WHERE id_usuario = $3;`,
            [currentAttempts, lockoutMinutes, firstRow.id_usuario]
          );
          const err = new Error(`Demasiados intentos fallidos (${maxAttempts}). Tu cuenta ha sido bloqueada temporalmente por ${lockoutMinutes} minutos por seguridad.`);
          (err as any).status = 429;
          throw err;
        } else {
          await pool.query(
            `UPDATE usuarios
             SET intentos_fallidos = $1
             WHERE id_usuario = $2;`,
            [currentAttempts, firstRow.id_usuario]
          );
          const remaining = maxAttempts - currentAttempts;
          const err = new Error(`Credenciales inválidas. Contraseña incorrecta. (Intentos restantes: ${remaining})`);
          (err as any).status = 401;
          throw err;
        }
      }

      if (firstRow.intentos_fallidos > 0 || firstRow.bloqueado_hasta) {
        await pool.query(
          `UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = $1;`,
          [firstRow.id_usuario]
        );
      }

      const roles: string[] = Array.from(new Set(
        result.rows
          .map((row: any) => row.nombre_rol)
          .filter((role: any): role is string => role === 'ADMIN' || role === 'TERAPEUTA' || role === 'PADRE' || role === 'SOPORTE_TECNICO'),
      ));

      if (roles.length === 0) {
        const err = new Error('La cuenta no tiene un rol activo asignado. Comuníquese con el administrador.');
        (err as any).status = 403;
        throw err;
      }

      let primaryRole: 'ADMIN' | 'TERAPEUTA' | 'PADRE' | 'SOPORTE_TECNICO' = 'PADRE';
      if (roles.includes('SOPORTE_TECNICO')) primaryRole = 'SOPORTE_TECNICO';
      else if (roles.includes('ADMIN')) primaryRole = 'ADMIN';
      else if (roles.includes('TERAPEUTA')) primaryRole = 'TERAPEUTA';
      else primaryRole = 'PADRE';

      const user = {
        id_usuario: Number(firstRow.id_usuario),
        codigo_usuario: firstRow.codigo_usuario,
        email: firstRow.email,
        nombres: firstRow.nombres,
        apellidos: firstRow.apellidos,
        rol: primaryRole,
        roles,
        activo: Boolean(firstRow.activo),
        password_change_required: Boolean(firstRow.password_change_required),
        totp_activado: Boolean(firstRow.totp_activado),
      };

      if (firstRow.totp_activado) {
        // Generar un ticket provisional de desafío (validez de 5 minutos, mfa_verificado = false)
        const { token, tokenHash } = createSessionToken();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
        await pool.query(
          `INSERT INTO sesiones_autenticacion
             (id_usuario, token_hash, fecha_emision, fecha_expiracion, ultima_actividad, mfa_verificado, revocado)
           VALUES ($1, $2, $3, $4, $5, false, false);`,
          [user.id_usuario, tokenHash, now, expiresAt, now],
        );
        return {
          requires_2fa: true,
          mfa_ticket: token,
          user,
          usuario: user,
          message: 'Se requiere código de verificación en dos pasos (2FA)',
        };
      }

      // The client receives a random opaque credential; only its SHA-256 hash is stored.
      const token = await persistSession(pool, user.id_usuario);
      return { token, user, usuario: user, message: 'Inicio de sesión exitoso' };
    } catch (err: any) {
      if (err.status) throw err;
      console.error('[AuthService] Error de conexión a PostgreSQL:', err);

      // Account identity and roles must come from persistence, including during outages.
      throw err;
    }
  }

  async verify2faLogin(mfaTicket: string, code: string) {
    const tokenHash = hashSessionToken(mfaTicket);
    const sessionRes = await pool.query(
      `SELECT s.id_sesion_auth, s.id_usuario, s.fecha_expiracion, s.mfa_verificado, s.revocado,
              u.codigo_usuario, u.email, u.nombres, u.apellidos, u.activo, u.password_change_required,
              u.intentos_fallidos, u.bloqueado_hasta, u.totp_secret, u.totp_activado,
              r.nombre_rol
       FROM sesiones_autenticacion s
       JOIN usuarios u ON u.id_usuario = s.id_usuario
       LEFT JOIN usuario_roles ur ON ur.id_usuario = u.id_usuario AND ur.activo = true
       LEFT JOIN roles r ON ur.id_rol = r.id_rol
       WHERE s.token_hash = $1
         AND s.revocado = false
         AND s.fecha_expiracion > NOW()
         AND u.activo = true;`,
      [tokenHash],
    );

    if (sessionRes.rows.length === 0) {
      const err = new Error('Desafío de verificación expirado o inválido. Por favor inicia sesión nuevamente.');
      (err as any).status = 401;
      throw err;
    }

    const row = sessionRes.rows[0];
    const now = new Date();
    if (row.bloqueado_hasta && new Date(row.bloqueado_hasta) > now) {
      const diffMs = new Date(row.bloqueado_hasta).getTime() - now.getTime();
      const diffMinutes = Math.max(1, Math.ceil(diffMs / 60000));
      const err = new Error(`Demasiados intentos fallidos. Tu cuenta está temporalmente bloqueada por seguridad. Inténtalo de nuevo en ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}.`);
      (err as any).status = 429;
      throw err;
    }

    if (!row.totp_secret || !row.totp_activado) {
      const err = new Error('La cuenta no tiene configurado el segundo factor.');
      (err as any).status = 400;
      throw err;
    }

    const valid = verifyTotpCode(row.totp_secret, code, 1);
    if (!valid) {
      const currentAttempts = Number(row.intentos_fallidos || 0) + 1;
      const maxAttempts = settings.AUTH_MAX_FAILED_ATTEMPTS;
      const lockoutMinutes = settings.AUTH_LOCKOUT_MINUTES;

      if (currentAttempts >= maxAttempts) {
        await pool.query(
          `UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = NOW() + ($2 || ' minutes')::interval WHERE id_usuario = $3;`,
          [currentAttempts, lockoutMinutes, row.id_usuario],
        );
        await pool.query(`UPDATE sesiones_autenticacion SET revocado = true WHERE token_hash = $1;`, [tokenHash]);
        const err = new Error(`Demasiados intentos fallidos (${maxAttempts}). Tu cuenta ha sido bloqueada temporalmente por ${lockoutMinutes} minutos por seguridad.`);
        (err as any).status = 429;
        throw err;
      } else {
        await pool.query(`UPDATE usuarios SET intentos_fallidos = $1 WHERE id_usuario = $2;`, [currentAttempts, row.id_usuario]);
        const remaining = maxAttempts - currentAttempts;
        const err = new Error(`Código 2FA incorrecto o expirado. (Intentos restantes: ${remaining})`);
        (err as any).status = 401;
        throw err;
      }
    }

    // Éxito: extender la expiración a la duración normal configurada y marcar MFA verificado
    const fullExpiresAt = new Date(Date.now() + sessionLifetimeMs);
    await pool.query(
      `UPDATE sesiones_autenticacion
       SET mfa_verificado = true, fecha_expiracion = $1, ultima_actividad = NOW()
       WHERE token_hash = $2;`,
      [fullExpiresAt, tokenHash],
    );

    if (row.intentos_fallidos > 0 || row.bloqueado_hasta) {
      await pool.query(`UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = $1;`, [row.id_usuario]);
    }

    const roles: string[] = Array.from(new Set(
      sessionRes.rows
        .map((r: any) => r.nombre_rol)
        .filter((role: any): role is string => role === 'ADMIN' || role === 'TERAPEUTA' || role === 'PADRE' || role === 'SOPORTE_TECNICO'),
    ));

    let primaryRole: 'ADMIN' | 'TERAPEUTA' | 'PADRE' | 'SOPORTE_TECNICO' = 'PADRE';
    if (roles.includes('SOPORTE_TECNICO')) primaryRole = 'SOPORTE_TECNICO';
    else if (roles.includes('ADMIN')) primaryRole = 'ADMIN';
    else if (roles.includes('TERAPEUTA')) primaryRole = 'TERAPEUTA';

    const user = {
      id_usuario: Number(row.id_usuario),
      codigo_usuario: row.codigo_usuario,
      email: row.email,
      nombres: row.nombres,
      apellidos: row.apellidos,
      rol: primaryRole,
      roles,
      activo: Boolean(row.activo),
      password_change_required: Boolean(row.password_change_required),
      totp_activado: true,
    };

    return { token: mfaTicket, user, usuario: user, message: 'Inicio de sesión exitoso' };
  }

  async setup2fa(userId: number, codigoUsuario: string) {
    const secret = generateTotpSecret(20);
    await pool.query(`UPDATE usuarios SET totp_temp_secret = $1 WHERE id_usuario = $2;`, [secret, userId]);

    const uri = generateTotpUri(`ASHAKids (${codigoUsuario})`, 'ASHAKids', secret);
    const qrCode = await QRCode.toDataURL(uri, {
      width: 256,
      margin: 2,
      color: { dark: '#1C1135', light: '#FFFFFF' },
    });

    const manualCode = secret.match(/.{1,4}/g)?.join(' ') || secret;
    return {
      qr_code: qrCode,
      secret,
      manual_code: manualCode,
      uri,
    };
  }

  async confirm2faSetup(userId: number, code: string) {
    const res = await pool.query(`SELECT totp_temp_secret FROM usuarios WHERE id_usuario = $1;`, [userId]);
    const tempSecret = res.rows[0]?.totp_temp_secret;
    if (!tempSecret) {
      const err = new Error('No se ha iniciado un proceso de configuración 2FA.');
      (err as any).status = 400;
      throw err;
    }

    const isValid = verifyTotpCode(tempSecret, code, 1);
    if (!isValid) {
      const err = new Error('Código incorrecto. Verifica el reloj de tu dispositivo e ingresa el código actual de 6 dígitos.');
      (err as any).status = 400;
      throw err;
    }

    await pool.query(
      `UPDATE usuarios
       SET totp_secret = totp_temp_secret, totp_activado = true, totp_temp_secret = NULL
       WHERE id_usuario = $1;`,
      [userId],
    );

    return { message: 'Autenticación en dos pasos (2FA) activada correctamente.', totp_activado: true };
  }

  async disable2fa(userId: number, password?: string, code?: string) {
    const userRes = await pool.query(
      `SELECT password_hash, totp_secret, totp_activado FROM usuarios WHERE id_usuario = $1;`,
      [userId],
    );
    if (userRes.rows.length === 0) {
      const err = new Error('Usuario no encontrado.');
      (err as any).status = 404;
      throw err;
    }

    const u = userRes.rows[0];
    let authorized = false;

    if (code && u.totp_secret) {
      authorized = verifyTotpCode(u.totp_secret, code, 1);
    }
    if (!authorized && password && u.password_hash) {
      try {
        authorized = await argon2.verify(u.password_hash, password);
      } catch {
        // Continuar
      }
    }

    if (!authorized) {
      const err = new Error('Debes ingresar tu contraseña actual o tu código 2FA para desactivar la autenticación en dos pasos.');
      (err as any).status = 401;
      throw err;
    }

    await pool.query(
      `UPDATE usuarios
       SET totp_secret = NULL, totp_activado = false, totp_temp_secret = NULL
       WHERE id_usuario = $1;`,
      [userId],
    );

    return { message: 'Autenticación en dos pasos desactivada correctamente.', totp_activado: false };
  }

  async get2faStatus(userId: number) {
    const res = await pool.query(`SELECT totp_activado FROM usuarios WHERE id_usuario = $1;`, [userId]);
    return { totp_activado: Boolean(res.rows[0]?.totp_activado) };
  }

  async revokeSession(token?: string): Promise<void> {
    if (!token) return;
    await pool.query(
      `UPDATE sesiones_autenticacion
       SET revocado = true, fecha_cierre = NOW(), ultima_actividad = NOW()
       WHERE token_hash = $1 AND revocado = false;`,
      [hashSessionToken(token)],
    );
  }

  async getCurrentUser(user: any) {
    return user;
  }
}

export const authService = new AuthService();
