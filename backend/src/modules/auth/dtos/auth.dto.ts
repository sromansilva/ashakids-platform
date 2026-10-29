import { z } from 'zod';

export const loginSchema = z.object({
  codigo_usuario: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
}).refine((data) => Boolean(data.codigo_usuario || data.email), {
  message: 'Debe ingresar su código de usuario o correo electrónico',
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nombres: z.string().min(2, 'El nombre es obligatorio'),
  apellidos: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Email no válido'),
  password: z.string().min(12, 'Contraseña de al menos 12 caracteres'),
  codigo_usuario: z.string().optional(),
  telefono: z.string().optional(),
  tipo_documento: z.string().optional(),
  numero_documento: z.string().optional(),
  rol: z.enum(['ADMIN', 'TERAPEUTA', 'PADRE']).default('PADRE'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  codigo_usuario: z.string().optional(),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
