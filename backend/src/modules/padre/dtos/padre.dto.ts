import { z } from 'zod';

export const registrarHijoSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  genero: z.string().optional(),
  parentesco: z.string().optional(),
  notas: z.string().optional(),
});

export type RegistrarHijoDTO = z.infer<typeof registrarHijoSchema>;

export const reservarCitaPadreSchema = z.object({
  id_terapeuta: z.number(),
  id_paciente: z.number(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/),
  motivo: z.string().optional(),
});

export type ReservarCitaPadreDTO = z.infer<typeof reservarCitaPadreSchema>;

