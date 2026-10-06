/**
 * Servicio de llamadas HTTP para el área de Terapeutas / Especialistas.
 */

import { apiClient } from "@/api/client";
import { TerapeutaProfileResponse } from "@/types/auth";

export const terapeutasService = {
  /**
   * Consulta el perfil del terapeuta autenticado (GET /api/v1/terapeutas/me).
   * Requiere sesión activa y rol TERAPEUTA.
   */
  async getMe(): Promise<TerapeutaProfileResponse> {
    return apiClient.get<TerapeutaProfileResponse>("/terapeutas/me");
  },
};
