import { z } from 'zod';

export const disponibilidadSlotSchema = z.object({
  dia_semana: z.number().min(0).max(6),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/),
  activo: z.boolean().default(true),
});

export const updateDisponibilidadSchema = z.object({
  slots: z.array(disponibilidadSlotSchema),
});

export type UpdateDisponibilidadDTO = z.infer<typeof updateDisponibilidadSchema>;

export const reporteClinicoSchema = z.object({
  id_sesion: z.number(),
  id_paciente: z.number(),
  observaciones: z.string().min(10, 'Observaciones clínicas detalladas'),
  plan_trabajo: z.string().optional(),
  nivel_logro: z.string().optional(),
});

export type ReporteClinicoDTO = z.infer<typeof reporteClinicoSchema>;

