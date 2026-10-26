import { z } from 'zod';

export const agendarCitaSchema = z.object({
  id_paciente: z.number(),
  id_terapeuta: z.number(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  motivo: z.string().optional(),
});

export type AgendarCitaDTO = z.infer<typeof agendarCitaSchema>;

export const cambiarEstadoCitaSchema = z.object({
  estado: z.enum(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'REAGENDADA']),
  motivo_cambio: z.string().optional(),
});

export type CambiarEstadoCitaDTO = z.infer<typeof cambiarEstadoCitaSchema>;

