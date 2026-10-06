/**
 * Servicio de llamadas HTTP para el área de Administración.
 */

import { apiClient } from "@/api/client";
import { AdminProfileResponse } from "@/types/auth";

export const adminService = {
  /**
   * Consulta el perfil del administrador autenticado (GET /api/v1/admin/me).
   * Requiere sesión activa y rol ADMIN.
   */
  async getMe(): Promise<AdminProfileResponse> {
    return apiClient.get<AdminProfileResponse>("/admin/me");
  },
};
