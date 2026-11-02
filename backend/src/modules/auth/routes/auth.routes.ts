import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', (req, res, next) => authController.login(req, res, next));
authRouter.post('/register', (_req, res) => {
  res.status(403).json({
    error: 'El registro público no está disponible. Solicita tu cuenta por el canal oficial de AshaKids.',
    mensaje: 'El personal autorizado crea las cuentas familiares y envía un enlace seguro para activar el acceso.',
  });
});
authRouter.get('/me', authenticate, (req, res) => authController.me(req, res));
authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));
authRouter.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.post('/create-password', (req, res, next) => authController.createPassword(req, res, next));
authRouter.post('/reset-password', (req, res, next) => authController.createPassword(req, res, next));
authRouter.post('/resend-activation', (req, res, next) => authController.resendActivation(req, res, next));
