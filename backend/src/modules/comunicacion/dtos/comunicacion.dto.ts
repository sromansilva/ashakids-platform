import { z } from 'zod';

export const enviarMensajeSchema = z.object({
  destinatario_id: z.number(),
  contenido: z.string().min(1, 'El mensaje no puede estar vacío'),
  adjunto_url: z.string().optional(),
});

export type EnviarMensajeDTO = z.infer<typeof enviarMensajeSchema>;

export const crearIncidenciaSchema = z.object({
  categoria: z.string().min(2),
  descripcion: z.string().min(10),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA']).optional().default('MEDIA'),
});

export type CrearIncidenciaDTO = z.infer<typeof crearIncidenciaSchema>;

