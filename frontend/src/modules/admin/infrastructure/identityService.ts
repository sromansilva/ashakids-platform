import { apiClient } from '@/core/api/client';

export interface DniData {
  numero: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  apellidos: string;
  nombreCompleto: string;
  fuente?: 'DECOLECTA_RENIEC' | 'MOCK_DESARROLLO';
}

export interface DniResponse {
  success: boolean;
  data?: DniData;
  message?: string;
}

export interface RucData {
  ruc: string;
  razonSocial: string;
  estado: string;
  condicion: string;
  direccion: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  fuente?: 'DECOLECTA_SUNAT' | 'MOCK_DESARROLLO';
}

export interface RucResponse {
  success: boolean;
  data?: RucData;
  message?: string;
}

export const identityService = {
  consultarDni: async (dni: string, signal?: AbortSignal): Promise<DniResponse> => {
    return apiClient.get<DniResponse>(`/identidad/dni/${encodeURIComponent(dni.trim())}`, { signal });
  },
  consultarRuc: async (ruc: string, signal?: AbortSignal): Promise<RucResponse> => {
    return apiClient.get<RucResponse>(`/identidad/ruc/${encodeURIComponent(ruc.trim())}`, { signal });
  },
};
