/**
 * Servicio de llamadas HTTP para el área de Terapeutas / Especialistas.
 */

import { apiClient } from "@/core/api/client";
import { TerapeutaProfileResponse } from "@/modules/auth/domain/auth";

export interface PublicTherapistItem {
  id_terapeuta: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  anios_experiencia?: number | null;
  idiomas?: string | null;
  descripcion_profesional: string | null;
  foto_perfil_url: string | null;
}

export const terapeutasService = {
  /**
   * Consulta el directorio público de terapeutas activos (GET /api/v1/terapeutas).
   * Expone únicamente información profesional no sensible.
   */
  async getPublicDirectory(signal?: AbortSignal): Promise<PublicTherapistItem[]> {
    return apiClient.get<PublicTherapistItem[]>("/terapeutas?limit=50", { signal });
  },

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
