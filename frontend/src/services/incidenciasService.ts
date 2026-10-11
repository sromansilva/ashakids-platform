import { apiClient } from '@/api/client';

export const tiposIncidencia = ['Funcional', 'Visual / Diseño', 'Carga / Rendimiento', 'Error de datos', 'Paciente / Agenda', 'Otro'];
export type Incidencia = {
  id_incidencia: number; tipo: string; titulo: string; descripcion: string;
  estado: 'NUEVA' | 'LEIDA' | 'RESUELTA'; fecha_creacion: string;
};
export type IncidenciaAdmin = Incidencia & { usuario: string; rol: string };
export const incidenciasService = {
  crear: (body: { envio_id: string; tipo: string; titulo: string; descripcion: string }) => apiClient.post<Incidencia>('/incidencias', body),
  listar: (offset = 0, signal?: AbortSignal) => apiClient.get<{ items: IncidenciaAdmin[]; total: number }>('/admin/incidencias', { params: { offset, limit: 20 }, signal }),
  estado: (id: number, estado: 'LEIDA' | 'RESUELTA') => apiClient.patch<Incidencia>(`/admin/incidencias/${id}`, { estado }),
};
