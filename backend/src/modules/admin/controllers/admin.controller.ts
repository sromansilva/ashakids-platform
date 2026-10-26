import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { crearCuentaAdminSchema, actualizarCuentaAdminSchema, cuentasQuerySchema } from '../dtos/admin.dto.js';

export class AdminController {
  async getCuentas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = cuentasQuerySchema.parse(req.query);
      const result = await adminService.getCuentas(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCuenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const result = await adminService.getCuenta(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearCuenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = crearCuentaAdminSchema.parse(req.body);
      const result = await adminService.crearCuenta(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async actualizarCuenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const dto = actualizarCuentaAdminSchema.parse(req.body);
      const result = await adminService.actualizarCuenta(id, dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAuditoria(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getAuditoria();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    res.json({
      ...(req.user || {}),
      modulo: 'ADMINISTRACION',
      permisos: ['ALL'],
    });
  }
}

export const adminController = new AdminController();
