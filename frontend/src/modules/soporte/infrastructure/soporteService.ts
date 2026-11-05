import { apiClient } from '@/core/api/client';
import type { TicketSoporte, FiltrosSoporte, EstadoSoporte } from '../domain/soporte';
import type { Incidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';
import type { IncidentNote } from '@/shared/domain/types/IncidentNote';

const base = '/soporte/incidencias';
export const soporteService = {
  listar: (params: FiltrosSoporte, signal?: AbortSignal) => apiClient.get<{ items: TicketSoporte[]; total: number }>(base, { params: { ...params }, signal }),
  obtener: (id: number, signal?: AbortSignal) => apiClient.get<TicketSoporte>(`${base}/${id}`, { signal }),
  crear: async (body: { tipo: string; titulo?: string; descripcion: string; envio_id?: string }): Promise<Incidencia> => {
    const descripcion = body.titulo?.trim() ? `${body.titulo.trim()}\n${body.descripcion}` : body.descripcion;
    const result = await apiClient.post<TicketSoporte>(base, { tipo: body.tipo, descripcion, envio_id: body.envio_id });
    return { ...result, titulo: result.tipo, area_destino: 'SOPORTE_TECNICO' };
  },
  estado: (id: number, estado: EstadoSoporte) => apiClient.patch<TicketSoporte>(`${base}/${id}/estado`, { estado }),
  notas: (id: number, signal?: AbortSignal) => apiClient.get<{ items: IncidentNote[] }>(`${base}/${id}/notas`, { signal }),
  responder: (id: number, contenido: string, interna: boolean) => apiClient.post<IncidentNote>(`${base}/${id}/notas`, { contenido, interna }),
};
