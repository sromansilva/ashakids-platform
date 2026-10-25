import type { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema, forgotPasswordSchema } from '../dtos/auth.dto.js';
import { authService } from '../services/auth.service.js';
import { settings } from '../../../core/config.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);

      res.cookie(settings.SESSION_COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: settings.ENVIRONMENT === 'production',
        sameSite: 'lax',
        path: '/',
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await authService.register(dto);
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

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(settings.SESSION_COOKIE_NAME, { path: '/' });
    res.json({ message: 'Sesión cerrada correctamente' });
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

