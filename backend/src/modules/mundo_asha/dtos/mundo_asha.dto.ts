import { z } from 'zod';

export const progresoJuegoSchema = z.object({
  id_paciente: z.number(),
  juego_slug: z.string().min(2),
  mundo: z.string(),
  nivel: z.number().min(1),
  puntaje: z.number().min(0),
  aciertos: z.number().min(0),
  errores: z.number().min(0),
  duracion_segundos: z.number().min(0),
});

export type ProgresoJuegoDTO = z.infer<typeof progresoJuegoSchema>;

export const reconocimientoVozSchema = z.object({
  audio_base64: z.string().min(10),
  palabra_objetivo: z.string().min(1),
});

export type ReconocimientoVozDTO = z.infer<typeof reconocimientoVozSchema>;

