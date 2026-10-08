/**
 * Servicio de llamadas HTTP para el área de Hijos / Pacientes del Tutor.
 */

import { apiClient } from "@/api/client";
import {
  ActualizarHijoPayload,
  CrearHijoPayload,
  HijoItemResponse,
  HijoListResponse,
  OperacionHijoResponse,
  PacienteItem,
} from "@/types/pacientes";

export const pacientesService = {
  /**
   * Obtiene todos los hijos activos asociados al tutor autenticado.
   */
  async getHijos(): Promise<HijoListResponse> {
    return apiClient.get<HijoListResponse>("/padres/hijos");
  },

  /**
   * Obtiene el detalle de un hijo autorizado.
   */
  async getHijo(id_paciente: number): Promise<PacienteItem> {
    return apiClient.get<PacienteItem>(`/padres/hijos/${id_paciente}`);
  },

  /**
   * Crea un nuevo hijo vinculado al tutor autenticado.
   */
  async crearHijo(payload: CrearHijoPayload): Promise<OperacionHijoResponse> {
    return apiClient.post<OperacionHijoResponse>("/padres/hijos", payload);
  },

  /**
   * Actualiza datos personales y avatar del hijo autorizado.
   */
  async actualizarHijo(
    id_paciente: number,
    payload: ActualizarHijoPayload
  ): Promise<OperacionHijoResponse> {
    return apiClient.put<OperacionHijoResponse>(
      `/padres/hijos/${id_paciente}`,
      payload,
      { method: "PATCH" }
    );
  },

  /**
   * Inactiva lógicamente al hijo preservando todo su historial.
   */
  async inactivarHijo(id_paciente: number): Promise<OperacionHijoResponse> {
    return apiClient.put<OperacionHijoResponse>(
      `/padres/hijos/${id_paciente}/inactivar`,
      {},
      { method: "PATCH" }
    );
  },

  /**
   * Eliminación física únicamente si no posee dependencias clínicas.
   */
  async eliminarHijo(id_paciente: number): Promise<OperacionHijoResponse> {
    return apiClient.del<OperacionHijoResponse>(`/padres/hijos/${id_paciente}`);
  },
};
