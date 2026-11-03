import { z } from 'zod';

export const loginSchema = z.object({
  codigo_usuario: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
}).refine((data) => Boolean(data.codigo_usuario || data.email), {
  message: 'Debe ingresar su código de usuario o correo electrónico',
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  codigo_usuario: z.string().optional(),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
