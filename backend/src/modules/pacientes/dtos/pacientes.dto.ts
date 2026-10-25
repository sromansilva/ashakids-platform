import { z } from 'zod';

export const pacienteSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  genero: z.string().optional(),
  id_padre: z.number().optional(),
  activo: z.boolean().default(true),
});

export type PacienteDTO = z.infer<typeof pacienteSchema>;

