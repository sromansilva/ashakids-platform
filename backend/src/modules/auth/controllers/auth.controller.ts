import type { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../dtos/auth.dto.js';
import { authService } from '../services/auth.service.js';
import { settings } from '../../../core/config.js';
import { getSessionToken } from '../../../core/middleware/auth.middleware.js';

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

      setSessionCookie(res, result.token);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await authService.register(dto);
      setSessionCookie(res, result.token);
      res.status(201).json(result);
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
      res.json({ message: `Si ${dto.email} está registrado, recibirá instrucciones de recuperación.` });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

