import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', (req, res, next) => authController.login(req, res, next));
authRouter.post('/register', (req, res, next) => authController.register(req, res, next));
authRouter.get('/me', authenticate, (req, res) => authController.me(req, res));
authRouter.post('/logout', (req, res) => authController.logout(req, res));
authRouter.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));

