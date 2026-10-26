/**
 * Data Transfer Objects (DTOs) para Autenticación y Cuentas.
 */

export interface LoginDTO {
  email: string;
  password?: string;
  codigo?: string;
}

export interface RegisterDTO {
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
}

export interface AuthResponseDTO {
  token?: string;
  id_usuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
  roles: string[];
  activo: boolean;
}

export interface PasswordResetRequestDTO {
  email: string;
}

export interface PasswordResetConfirmDTO {
  token: string;
  nueva_password: string;
}

export interface SessionVerificationDTO {
  isAuthenticated: boolean;
  usuario?: AuthResponseDTO;
}

