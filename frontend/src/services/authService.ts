/**
 * Servicio de llamadas HTTP para el subsistema de autenticación.
 */

import { apiClient } from "@/api/client";
import {
  AuthResponse,
  LoginCredentials,
  MessageResponse,
  User,
} from "@/types/auth";

export const authService = {
  /**
   * Envía credenciales a FastAPI (POST /api/v1/auth/login) y fija cookie HttpOnly.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  /**
   * Revoca sesión en FastAPI (POST /api/v1/auth/logout) y limpia cookie HttpOnly.
   */
  async logout(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/logout");
  },

  /**
   * Consulta el usuario autenticado activo (GET /api/v1/auth/me).
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },
};
