import { z } from 'zod';

export const sesionClinicaSchema = z.object({
  id_cita: z.number(),
  id_paciente: z.number(),
  id_terapeuta: z.number(),
  fecha: z.string(),
  hora_inicio: z.string(),
  objetivos: z.array(z.string()).optional(),
  resumen: z.string().optional(),
});

export type SesionClinicaDTO = z.infer<typeof sesionClinicaSchema>;

export const valoracionInicialSchema = z.object({
  id_paciente: z.number(),
  id_terapeuta: z.number(),
  fecha: z.string(),
  diagnostico: z.string().min(5),
  areas_afectadas: z.array(z.string()).optional(),
  recomendaciones: z.string().optional(),
});

export type ValoracionInicialDTO = z.infer<typeof valoracionInicialSchema>;

export const consentimientoSchema = z.object({
  id_paciente: z.number().int().positive(),
  tipo_consentimiento: z.string().default('EVALUACION_FONOLOGICA_IA'),
  estado: z.enum(['CONCEDIDO', 'REVOCADO']).default('CONCEDIDO'),
});

export type ConsentimientoDTO = z.infer<typeof consentimientoSchema>;

export const prediccionPlanSchema = z.object({
  id_sesion: z.number().int().positive(),
  codigo_diagnostico: z.number().int().min(1).max(5),
  frecuencia_semanal: z.number().int().min(1).max(3),
}).strict();

export type PrediccionPlanDTO = z.infer<typeof prediccionPlanSchema>;

export const descartarPrediccionSchema = z.object({
  observaciones_terapeuta: z.string().trim().max(2000).optional(),
}).strict();

export type DescartarPrediccionDTO = z.infer<typeof descartarPrediccionSchema>;

export const evaluacionFonologicaSchema = z.object({
  id_sesion: z.number().int().positive(),
  id_paciente: z.number().int().positive(),
  fonema_objetivo: z.enum(['/rr/', '/r/', '/s/', '/pl/', '/tr/']).optional(),
  palabra_objetivo: z.string().trim().min(1).max(80),
  transcripcion_detectada: z.string().trim().min(1).max(500),
  origen_evaluacion: z.literal('CLINICO').default('CLINICO'),
}).strict();

export type EvaluacionFonologicaDTO = z.infer<typeof evaluacionFonologicaSchema>;

export const revisionEvaluacionFonologicaSchema = z.object({
  estado: z.enum(['CONFIRMADO_TERAPEUTA', 'DESCARTADO']),
  transcripcion_revisada: z.string().trim().max(500).optional(),
  observacion_terapeuta: z.string().trim().max(2000).optional(),
  resultado_clinico: z.enum(['ALCANZADO', 'EN_PROCESO', 'REQUIERE_APOYO']).optional(),
}).strict().refine(
  (value) => value.estado !== 'CONFIRMADO_TERAPEUTA' || Boolean(value.transcripcion_revisada && value.observacion_terapeuta),
  { message: 'Confirma la transcripción y agrega una observación del terapeuta.' },
).refine(
  (value) => value.estado !== 'CONFIRMADO_TERAPEUTA' || Boolean(value.resultado_clinico),
  { message: 'Indica el resultado observado por el terapeuta antes de confirmar.' },
);

export type RevisionEvaluacionFonologicaDTO = z.infer<typeof revisionEvaluacionFonologicaSchema>;
