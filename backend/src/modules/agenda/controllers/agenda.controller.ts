import type { Request, Response, NextFunction } from 'express';
import { agendaService } from '../services/agenda.service.js';
import { agendarCitaSchema, cambiarEstadoCitaSchema } from '../dtos/agenda.dto.js';
import { citasService } from '../../citas/citas.service.js';
import { assertReservationAccess } from '../../../core/security/clinical-access.js';

export class AgendaController {
  async getCitas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fecha = req.query.fecha as string | undefined;
      const terapeutaId = req.query.terapeutaId ? parseInt(req.query.terapeutaId as string, 10) : undefined;
      const result = await agendaService.getCitas({ fecha, terapeutaId }, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async agendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = agendarCitaSchema.parse(req.body);
      const fechaHora = new Date(`${dto.fecha}T${dto.hora_inicio}:00-05:00`).toISOString();
      const result = await citasService.crear({
        id_paciente: dto.id_paciente,
        id_terapeuta: dto.id_terapeuta,
        fecha_hora_inicio: fechaHora,
        fecha_hora_fin: dto.hora_fin
          ? new Date(`${dto.fecha}T${dto.hora_fin}:00-05:00`).toISOString()
          : undefined,
        tipo_cita: 'INTRODUCTORIA',
        modalidad: 'VIRTUAL',
        modo_prueba: dto.modo_prueba,
      }, req.user!);
      res.status(201).json({
        id_cita: result.id_reserva,
        id_paciente: result.id_paciente,
        id_terapeuta: result.id_terapeuta,
        fecha: dto.fecha,
        hora_inicio: dto.hora_inicio,
        estado: result.estado_reserva,
        meet_url: result.meet_url,
        meet_origen: result.meet_origen,
        meet_automatico_configurado: result.meet_automatico_configurado,
        creado_en: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const dto = cambiarEstadoCitaSchema.parse(req.body);
      await assertReservationAccess(req.user!, id);
      const result = await citasService.cambiarEstado(id, dto.estado, req.user!);
      res.json({
        id_cita: result.id_reserva,
        estado: result.estado_reserva,
        motivo_cambio: dto.motivo_cambio,
        actualizado_en: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const agendaController = new AgendaController();
