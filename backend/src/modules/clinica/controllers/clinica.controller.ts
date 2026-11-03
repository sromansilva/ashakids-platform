import type { Request, Response, NextFunction } from 'express';
import { clinicaService } from '../services/clinica.service.js';
import {
  sesionClinicaSchema,
  valoracionInicialSchema,
  consentimientoSchema,
  prediccionPlanSchema,
  evaluacionFonologicaSchema,
  revisionEvaluacionFonologicaSchema,
  descartarPrediccionSchema,
} from '../dtos/clinica.dto.js';

export class ClinicaController {
  async getMlServiceHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await clinicaService.getMlServiceHealth(req.user!));
    } catch (err) {
      next(err);
    }
  }

  async getSesiones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string, 10) : undefined;
      const result = await clinicaService.getSesiones(pacienteId, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearSesion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = sesionClinicaSchema.parse(req.body);
      const result = await clinicaService.crearSesion(dto, req.user!);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearValoracion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = valoracionInicialSchema.parse(req.body);
      const result = await clinicaService.crearValoracion(dto, req.user!);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getConsentimiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pacienteId = parseInt(String(req.params.id_paciente), 10);
      if (!Number.isInteger(pacienteId) || pacienteId <= 0) {
        res.status(400).json({ error: 'ID de paciente inválido' });
        return;
      }
      const result = await clinicaService.getConsentimiento(pacienteId, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async registrarConsentimiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = consentimientoSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent'];
      const result = await clinicaService.registrarConsentimiento(dto, req.user!, ip, userAgent);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async predecirPlanTratamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = prediccionPlanSchema.parse(req.body);
      const result = await clinicaService.predecirPlanTratamiento(dto, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getTreatmentPredictionCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await clinicaService.getTreatmentPredictionCatalog(req.user!));
    } catch (err) {
      next(err);
    }
  }

  async descartarPrediccionTratamiento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id_prediccion);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: 'La predicción indicada no es válida.' });
        return;
      }
      const dto = descartarPrediccionSchema.parse(req.body);
      const result = await clinicaService.descartarPrediccionTratamiento(id, dto, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async registrarEvaluacionFonologica(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = evaluacionFonologicaSchema.parse(req.body);
      const result = await clinicaService.registrarEvaluacionFonologica(dto, req.user!);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getEvaluacionesFonologicas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pacienteId = parseInt(String(req.params.id_paciente), 10);
      if (!Number.isInteger(pacienteId) || pacienteId <= 0) {
        res.status(400).json({ error: 'ID de paciente inválido' });
        return;
      }
      const result = await clinicaService.getEvaluacionesFonologicas(pacienteId, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async revisarEvaluacionFonologica(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idEvaluacion = parseInt(String(req.params.id_evaluacion), 10);
      if (!Number.isInteger(idEvaluacion) || idEvaluacion <= 0) {
        res.status(400).json({ error: 'ID de evaluación inválido.' });
        return;
      }
      const dto = revisionEvaluacionFonologicaSchema.parse(req.body);
      const result = await clinicaService.revisarEvaluacionFonologica(idEvaluacion, dto, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const clinicaController = new ClinicaController();
