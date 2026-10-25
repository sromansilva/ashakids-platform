/**
 * Data Transfer Objects (DTOs) para vistas públicas.
 */

export interface ContactoFormDTO {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface NewsletterSuscripcionDTO {
  email: string;
}

export interface PostulacionTerapeutaDTO {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
  anios_experiencia: number;
  cv_url?: string;
}

