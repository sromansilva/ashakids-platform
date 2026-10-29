import { apiClient } from '@/core/api/client';

export const tiposIncidencia = [
  'Funcional',
  'Visual / Diseño',
  'Carga / Rendimiento',
  'Error de datos',
  'Paciente / Agenda',
  'Seguimiento Terapéutico',
  'Sesiones y Citas',
  'Mundo ASHA',
  'Cuentas y Permisos',
  'Seguridad y Acceso',
  'Información de Perfil',
  'Soporte de Plataforma',
  'Otro',
];

export type Incidencia = {
  id_incidencia: number;
  ticket?: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  solicitante?: string;
  rol_solicitante?: string;
  area_destino?: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
  responsable?: string;
  id_terapeuta?: number | null;
  terapeuta_nombre?: string | null;
  prioridad?: number;
  prioridad_texto?: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: 'NUEVA' | 'LEIDA' | 'LEÍDA' | 'EN PROCESO' | 'SOLUCIONADA' | 'ATENDIDA' | 'RESUELTA' | 'ABIERTA' | string;
  es_prueba?: boolean;
  fecha_creacion: string;
  fecha_actualizacion?: string;
};

export type IncidenciaAdmin = Incidencia & { usuario: string; rol: string; codigo?: string };

export interface TerapeutaOption {
  id_terapeuta: number;
  nombre: string;
  especialidad: string;
}

export const incidenciasService = {
  crear: (body: {
    envio_id: string;
    tipo: string;
    titulo?: string;
    descripcion: string;
    id_terapeuta?: number | null;
  }) => apiClient.post<Incidencia>('/incidencias', body),

  listar: (offset = 0, signal?: AbortSignal) =>
    apiClient.get<{ items: IncidenciaAdmin[]; total: number }>('/admin/incidencias', {
      params: { offset, limit: 50 },
      signal,
    }),

  misIncidencias: (signal?: AbortSignal) =>
    apiClient.get<{ items: Incidencia[]; total: number }>('/incidencias/mis-incidencias', { signal }),

  recibidasTerapeuta: (signal?: AbortSignal) =>
    apiClient.get<{ items: Incidencia[]; total: number }>('/incidencias/recibidas/terapeuta', { signal }),

  recibidasAdmin: (offset = 0, signal?: AbortSignal) =>
    apiClient.get<{ items: IncidenciaAdmin[]; total: number }>('/incidencias/recibidas/admin', {
      params: { offset, limit: 50 },
      signal,
    }),

  terapeutasRelacionados: (signal?: AbortSignal) =>
    apiClient.get<{ previos: TerapeutaOption[]; disponibles: TerapeutaOption[] }>(
      '/incidencias/terapeutas-relacionados',
      { signal }
    ),

  obtener: (id: number, signal?: AbortSignal) =>
    apiClient.get<Incidencia>(`/incidencias/${id}`, { signal }),

  cambiarEstado: (id: number, estado: string) =>
    apiClient.patch<Incidencia>(`/incidencias/${id}/estado`, { estado }),

  estado: (id: number, estado: 'LEIDA' | 'RESUELTA' | string) =>
    apiClient.patch<Incidencia>(`/admin/incidencias/${id}`, { estado }),
};
