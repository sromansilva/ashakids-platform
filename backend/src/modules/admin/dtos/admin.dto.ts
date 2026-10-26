import { z } from 'zod';

export const crearCuentaAdminSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  rol: z.enum(['ADMIN', 'TERAPEUTA', 'PADRE']),
  activo: z.boolean().default(true),
  telefono: z.string().optional(),
  tipo_documento: z.string().optional(),
  numero_documento: z.string().optional(),
});

export type CrearCuentaAdminDTO = z.infer<typeof crearCuentaAdminSchema>;

export const actualizarCuentaAdminSchema = z.object({
  nombres: z.string().min(2).optional(),
  apellidos: z.string().min(2).optional(),
  email: z.string().email().optional(),
  activo: z.boolean().optional(),
  telefono: z.string().optional(),
  tipo_documento: z.string().optional(),
  numero_documento: z.string().optional(),
});

export type ActualizarCuentaAdminDTO = z.infer<typeof actualizarCuentaAdminSchema>;

export const cuentasQuerySchema = z.object({
  rol: z.string().optional(),
  search: z.string().optional(),
  activo: z.string().optional().transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type CuentasQueryDTO = z.infer<typeof cuentasQuerySchema>;

