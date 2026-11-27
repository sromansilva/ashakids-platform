/**
 * Servicio de llamadas HTTP para el área de Padres y Tutores.
 */

import { apiClient } from "@/core/api/client";
import { PadreProfileResponse } from "@/modules/auth/domain/auth";

export const padresService = {
  /**
   * Consulta el perfil del padre autenticado (GET /api/v1/padres/me).
   * Requiere sesión activa y rol PADRE.
   */
  async getMe(): Promise<PadreProfileResponse> {
    return apiClient.get<PadreProfileResponse>("/padres/me");
  },

  /**
   * Envía una solicitud de desactivación de cuenta a administración (POST /api/v1/padres/solicitud-baja).
   * Valida contraseña actual y código 2FA si está activo.
   */
  async solicitarDesactivacion(payload: {
    password: string;
    totp_code?: string;
  }): Promise<{ message: string; solicitud: { id_solicitud: number; estado: string; fecha_solicitud: string } }> {
    return apiClient.post("/padres/solicitud-baja", payload);
  },
};
