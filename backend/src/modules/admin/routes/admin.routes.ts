import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const adminRouter = Router();

// Require authenticated ADMIN role for administration endpoints
adminRouter.use(authenticate, requireRoles(['ADMIN']));

adminRouter.get('/me', (req, res) => adminController.getMe(req, res));
adminRouter.get('/cuentas', (req, res, next) => adminController.getCuentas(req, res, next));
adminRouter.get('/cuentas/:id', (req, res, next) => adminController.getCuenta(req, res, next));
adminRouter.post('/cuentas', (req, res, next) => adminController.crearCuenta(req, res, next));
adminRouter.put('/cuentas/:id', (req, res, next) => adminController.actualizarCuenta(req, res, next));
adminRouter.get('/auditoria', (req, res, next) => adminController.getAuditoria(req, res, next));

