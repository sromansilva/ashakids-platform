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

