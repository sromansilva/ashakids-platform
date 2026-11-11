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

export const login2faSchema = z.object({
  mfa_ticket: z.string().min(1, 'El ticket MFA es obligatorio'),
  code: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos numéricos'),
});

export type Login2faDTO = z.infer<typeof login2faSchema>;

export const verify2faSetupSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos numéricos'),
});

export type Verify2faSetupDTO = z.infer<typeof verify2faSetupSchema>;

export const disable2faSchema = z.object({
  password: z.string().optional(),
  code: z.string().optional(),
});

export type Disable2faDTO = z.infer<typeof disable2faSchema>;
