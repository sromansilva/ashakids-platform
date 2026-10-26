/**
 * Servicio de llamadas HTTP para el subsistema de autenticación.
 */

import { apiClient } from "@/core/api/client";
import { AuthResponse, LoginCredentials, MessageResponse, User } from "@/modules/auth/domain/auth";

export const authService = {
  async createPassword(token: string, new_password: string): Promise<MessageResponse> {
    return apiClient.post("/auth/create-password", { token, new_password });
  },
  async resendActivation(codigo_usuario: string): Promise<MessageResponse> {
    return apiClient.post("/auth/resend-activation", { codigo_usuario });
  },
  async activate(current_password: string, new_password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/activate", { current_password, new_password });
  },
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
