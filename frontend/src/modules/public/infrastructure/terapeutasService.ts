/**
 * Servicio de llamadas HTTP para el área de Terapeutas / Especialistas.
 */

import { apiClient } from "@/core/api/client";
import { TerapeutaProfileResponse } from "@/modules/auth/domain/auth";

export const terapeutasService = {
  /**
   * Consulta el perfil del terapeuta autenticado (GET /api/v1/terapeutas/me).
   * Requiere sesión activa y rol TERAPEUTA.
   */
  async getMe(): Promise<TerapeutaProfileResponse> {
    return apiClient.get<TerapeutaProfileResponse>("/terapeutas/me");
  },

  async updateMyProfile(data: { telefono: string; cedula_profesional: string }) {
    return apiClient.patch<{ message: string }>("/terapeutas/me/perfil", data);
  },

  async uploadMyProfilePhoto(data: FormData) {
    return apiClient.upload<{ message: string }>("/terapeutas/me/foto-perfil", data);
  },

  async removeMyProfilePhoto() {
    return apiClient.del<{ message: string }>("/terapeutas/me/foto-perfil");
  },
};
