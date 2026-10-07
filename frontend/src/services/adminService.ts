/**
 * Servicio de llamadas HTTP para el área de Administración.
 */

import { apiClient } from "@/api/client";
import {
  ActualizarCuentaPayload,
  AdminProfileResponse,
  CrearPadrePayload,
  CrearTerapeutaPayload,
  CuentaItem,
  CuentaListResponse,
  OperacionCuentaResponse,
} from "@/types/auth";

export const adminService = {
  /**
   * Consulta el perfil del administrador autenticado (GET /api/v1/admin/me).
   * Requiere sesión activa y rol ADMIN.
   */
  async getMe(): Promise<AdminProfileResponse> {
    return apiClient.get<AdminProfileResponse>("/admin/me");
  },

  /**
   * Lista cuentas registradas con filtros opcionales (GET /api/v1/admin/cuentas).
   */
  async getCuentas(params?: {
    rol?: string;
    search?: string;
    activo?: boolean;
  }): Promise<CuentaListResponse> {
    const query = new URLSearchParams();
    if (params?.rol) query.append("rol", params.rol);
    if (params?.search) query.append("search", params.search);
    if (params?.activo !== undefined) query.append("activo", String(params.activo));

    const qs = query.toString();
    const endpoint = `/admin/cuentas${qs ? `?${qs}` : ""}`;
    return apiClient.get<CuentaListResponse>(endpoint);
  },

  /**
   * Obtiene el detalle de una cuenta individual (GET /api/v1/admin/cuentas/{id}).
   */
  async getCuenta(id_usuario: number): Promise<CuentaItem> {
    return apiClient.get<CuentaItem>(`/admin/cuentas/${id_usuario}`);
  },

  /**
   * Crea una nueva cuenta de Padre/Tutor (POST /api/v1/admin/cuentas/padres).
   */
  async crearPadre(payload: CrearPadrePayload): Promise<OperacionCuentaResponse> {
    return apiClient.post<OperacionCuentaResponse>("/admin/cuentas/padres", payload);
  },

  /**
   * Crea una nueva cuenta de Terapeuta (POST /api/v1/admin/cuentas/terapeutas).
   */
  async crearTerapeuta(payload: CrearTerapeutaPayload): Promise<OperacionCuentaResponse> {
    return apiClient.post<OperacionCuentaResponse>("/admin/cuentas/terapeutas", payload);
  },

  /**
   * Actualiza datos de usuario y perfil (PATCH /api/v1/admin/cuentas/{id}).
   */
  async actualizarCuenta(
    id_usuario: number,
    payload: ActualizarCuentaPayload
  ): Promise<OperacionCuentaResponse> {
    return apiClient.put<OperacionCuentaResponse>(
      `/admin/cuentas/${id_usuario}`,
      payload,
      { method: "PATCH" }
    );
  },

  /**
   * Suspende lógicamente una cuenta y revoca sesiones (PATCH /api/v1/admin/cuentas/{id}/suspender).
   */
  async suspenderCuenta(id_usuario: number): Promise<OperacionCuentaResponse> {
    return apiClient.put<OperacionCuentaResponse>(
      `/admin/cuentas/${id_usuario}/suspender`,
      {},
      { method: "PATCH" }
    );
  },

  /**
   * Reactiva una cuenta suspendida (PATCH /api/v1/admin/cuentas/{id}/activar).
   */
  async activarCuenta(id_usuario: number): Promise<OperacionCuentaResponse> {
    return apiClient.put<OperacionCuentaResponse>(
      `/admin/cuentas/${id_usuario}/activar`,
      {},
      { method: "PATCH" }
    );
  },

  /**
   * Elimina permanentemente una cuenta si no posee dependencias clínicas (DELETE /api/v1/admin/cuentas/{id}).
   */
  async eliminarCuenta(id_usuario: number): Promise<OperacionCuentaResponse> {
    return apiClient.del<OperacionCuentaResponse>(`/admin/cuentas/${id_usuario}`);
  },
};
