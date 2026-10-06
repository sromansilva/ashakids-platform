/**
 * Tipos de dominio para el sistema de autenticación y roles de ASHAKids.
 */

export type SemanticRole = "PADRE" | "TERAPEUTA" | "ADMIN";

export interface User {
  id_usuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  codigo_usuario: string;
  rol: SemanticRole;
  roles: SemanticRole[];
  activo: boolean;
}

export interface LoginCredentials {
  codigo_usuario: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  role: SemanticRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
