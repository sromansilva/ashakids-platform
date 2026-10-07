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

export interface TutorData {
  id_tutor: number | null;
  parentesco: string | null;
  telefono: string | null;
  direccion: string | null;
}

export interface PadreProfileResponse {
  user: User;
  perfil_tutor: TutorData | null;
}

export interface TerapeutaData {
  id_terapeuta: number | null;
  especialidad: string | null;
  anios_experiencia: number | null;
  idiomas: string | null;
  descripcion_profesional: string | null;
}

export interface TerapeutaProfileResponse {
  user: User;
  perfil_terapeuta: TerapeutaData | null;
}

export interface AdministradorData {
  id_administrador: number | null;
  fecha_creacion: string | null;
}

export interface AdminProfileResponse {
  user: User;
  perfil_admin: AdministradorData | null;
}
