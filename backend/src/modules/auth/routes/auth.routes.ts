import { Router } from 'express';
import { rateLimit } from '../../../core/middleware/rate-limit.js';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const authRouter = Router();
const loginLimit = rateLimit(20, 15 * 60_000);
const mfaLimit = rateLimit(20, 15 * 60_000);
const forgotLimit = rateLimit(10, 15 * 60_000);
const createLimit = rateLimit(20, 15 * 60_000);

authRouter.post('/login', loginLimit, (req, res, next) => authController.login(req, res, next));
authRouter.post('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));
authRouter.post('/login/2fa', mfaLimit, (req, res, next) => authController.verify2faLogin(req, res, next));
authRouter.get('/2fa/status', authenticate, (req, res, next) => authController.get2faStatus(req, res, next));
authRouter.post('/2fa/setup', authenticate, (req, res, next) => authController.setup2fa(req, res, next));
authRouter.post('/2fa/verify-setup', authenticate, (req, res, next) => authController.confirm2faSetup(req, res, next));
authRouter.post('/2fa/disable', authenticate, (req, res, next) => authController.disable2fa(req, res, next));
authRouter.post('/register', (_req, res) => {
  res.status(403).json({
    error: 'El registro público no está disponible. Solicita tu cuenta por el canal oficial de AshaKids.',
    mensaje: 'El personal autorizado crea las cuentas familiares y envía un enlace seguro para activar el acceso.',
  });
});
authRouter.get('/me', authenticate, (req, res) => authController.me(req, res));
authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));
authRouter.post('/forgot-password', forgotLimit, (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.post('/create-password', createLimit, (req, res, next) => authController.createPassword(req, res, next));
authRouter.post('/reset-password', createLimit, (req, res, next) => authController.createPassword(req, res, next));
authRouter.post('/resend-activation', (req, res, next) => authController.resendActivation(req, res, next));
