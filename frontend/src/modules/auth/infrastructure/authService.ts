/**
 * Servicio de llamadas HTTP para el subsistema de autenticación.
 */

import { apiClient } from "@/core/api/client";
import {
  AuthResponse,
  LoginCredentials,
  LoginResponse,
  MessageResponse,
  TwoFactorSetupData,
  TwoFactorStatusResponse,
  User,
} from "@/modules/auth/domain/auth";

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
   * Envía credenciales a la API (POST /api/v1/auth/login) y fija cookie HttpOnly si no requiere 2FA.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  /**
   * Completa el desafío 2FA enviando el ticket provisional y el código de 6 dígitos.
   */
  async verify2faLogin(payload: { mfa_ticket: string; code: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login/2fa", payload);
  },

  /**
   * Consulta el estado del segundo factor (2FA).
   */
  async get2faStatus(): Promise<TwoFactorStatusResponse> {
    return apiClient.get<TwoFactorStatusResponse>("/auth/2fa/status");
  },

  /**
   * Inicia la configuración de 2FA generando el secreto y código QR.
   */
  async setup2fa(): Promise<TwoFactorSetupData> {
    return apiClient.post<TwoFactorSetupData>("/auth/2fa/setup");
  },

  /**
   * Confirma y activa el 2FA con el código de 6 dígitos.
   */
  async confirm2faSetup(code: string): Promise<MessageResponse & { totp_activado: boolean }> {
    return apiClient.post<MessageResponse & { totp_activado: boolean }>("/auth/2fa/verify-setup", { code });
  },

  /**
   * Desactiva el 2FA.
   */
  async disable2fa(payload: { password?: string; code?: string }): Promise<MessageResponse & { totp_activado: boolean }> {
    return apiClient.post<MessageResponse & { totp_activado: boolean }>("/auth/2fa/disable", payload);
  },

  /**
   * Revoca sesión en la API (POST /api/v1/auth/logout) y limpia cookie HttpOnly.
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
