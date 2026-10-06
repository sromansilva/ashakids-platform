/**
 * Servicio de llamadas HTTP para el área de Padres y Tutores.
 */

import { apiClient } from "@/api/client";
import { PadreProfileResponse } from "@/types/auth";

export const padresService = {
  /**
   * Consulta el perfil del padre autenticado (GET /api/v1/padres/me).
   * Requiere sesión activa y rol PADRE.
   */
  async getMe(): Promise<PadreProfileResponse> {
    return apiClient.get<PadreProfileResponse>("/padres/me");
  },
};
