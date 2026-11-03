import { z } from 'zod';

export const progresoJuegoSchema = z.object({
  id_paciente: z.number().int().positive(),
  juego_slug: z.string().min(2).max(40),
  mundo: z.enum(['HABLA', 'LENGUAJE', 'FLUIDEZ', 'VOZ', 'OROFACIAL']),
  nivel: z.number().int().min(1).max(20),
  respuestas: z.array(z.string().max(200)).min(1).max(20),
  duracion_segundos: z.number().min(0).max(3600),
  ayudas_usadas: z.number().int().min(0).max(100).default(0),
  clave_intento: z.string().uuid(),
}).strict();

export type ProgresoJuegoDTO = z.infer<typeof progresoJuegoSchema>;

