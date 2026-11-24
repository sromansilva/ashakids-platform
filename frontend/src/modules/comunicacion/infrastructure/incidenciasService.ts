import { apiClient } from '@/core/api/client';
import type { IncidentState } from '@/shared/domain/types/IncidentState';
import type { IncidentNote } from '@/shared/domain/types/IncidentNote';

export const categoriasIncidencia = {
  'Problemas técnicos': [
    'Funcional',
    'Visual / Diseño',
    'Carga / Rendimiento',
    'Error de datos',
    'Soporte de Plataforma',
  ],
  'Problemas de permisos': [
    'Cuentas y Permisos',
    'Seguridad y Acceso',
  ],
  'Problemas de información': [
    'Información de Perfil',
    'Paciente / Agenda',
    'Seguimiento Terapéutico',
    'Sesiones y Citas',
    'Mundo ASHA',
    'Otro',
  ],
} as const;

export type CategoriaIncidencia = keyof typeof categoriasIncidencia;
export const tiposIncidencia = Object.values(categoriasIncidencia).flat();

export type RolIncidencia = 'PADRE' | 'TERAPEUTA' | 'ADMIN' | 'SOPORTE_TECNICO';
export interface VariedadIncidencia {
  value: string;
  label: string;
}

type VariedadesPorCategoria = Record<CategoriaIncidencia, readonly VariedadIncidencia[]>;
const opciones = (items: readonly string[], labels: Record<string, string> = {}): VariedadIncidencia[] =>
  items.map((value) => ({ value, label: labels[value] ?? value }));
const tecnicas = opciones(categoriasIncidencia['Problemas técnicos']);
const permisosPadre = opciones(categoriasIncidencia['Problemas de permisos'], {
  'Cuentas y Permisos': 'Acceso a mi cuenta y permisos familiares',
  'Seguridad y Acceso': 'Seguridad de mi cuenta',
});
const permisosTerapeuta = opciones(categoriasIncidencia['Problemas de permisos'], {
  'Cuentas y Permisos': 'Permisos para pacientes y herramientas',
  'Seguridad y Acceso': 'Seguridad de mi cuenta profesional',
});
const permisosAdmin = opciones(categoriasIncidencia['Problemas de permisos'], {
  'Cuentas y Permisos': 'Gestión de cuentas y roles',
  'Seguridad y Acceso': 'Seguridad y permisos de administración',
});
const todosLosPermisos = opciones(categoriasIncidencia['Problemas de permisos']);

const variedadesPorRol: Record<RolIncidencia, VariedadesPorCategoria> = {
  PADRE: {
    'Problemas técnicos': tecnicas,
    'Problemas de permisos': permisosPadre,
    'Problemas de información': opciones(categoriasIncidencia['Problemas de información'], {
      'Información de Perfil': 'Mi perfil familiar',
      'Paciente / Agenda': 'Datos de mis hijos',
      'Seguimiento Terapéutico': 'Seguimiento de terapia',
      'Sesiones y Citas': 'Citas y sesiones',
      'Mundo ASHA': 'Juegos y actividad de Mundo ASHA',
      Otro: 'Otra consulta de información',
    }),
  },
  TERAPEUTA: {
    'Problemas técnicos': tecnicas,
    'Problemas de permisos': permisosTerapeuta,
    'Problemas de información': opciones(['Información de Perfil', 'Paciente / Agenda', 'Seguimiento Terapéutico', 'Sesiones y Citas', 'Otro'], {
      'Información de Perfil': 'Mi perfil profesional',
      'Paciente / Agenda': 'Pacientes y agenda',
      'Seguimiento Terapéutico': 'Seguimiento de pacientes',
      'Sesiones y Citas': 'Agenda y sesiones',
      Otro: 'Otra consulta profesional',
    }),
  },
  ADMIN: {
    'Problemas técnicos': tecnicas,
    'Problemas de permisos': permisosAdmin,
    'Problemas de información': opciones(['Información de Perfil', 'Paciente / Agenda', 'Sesiones y Citas', 'Otro'], {
      'Información de Perfil': 'Mi perfil de administración',
      'Paciente / Agenda': 'Datos de cuentas y agenda',
      'Sesiones y Citas': 'Funcionamiento de citas y agenda',
      Otro: 'Otra consulta sobre información del sistema',
    }),
  },
  SOPORTE_TECNICO: {
    'Problemas técnicos': opciones(categoriasIncidencia['Problemas técnicos']),
    'Problemas de permisos': todosLosPermisos,
    'Problemas de información': opciones(categoriasIncidencia['Problemas de información']),
  },
};

export function variedadesIncidenciaParaRol(rol: RolIncidencia, categoria: CategoriaIncidencia): readonly VariedadIncidencia[] {
  return variedadesPorRol[rol][categoria];
}

export function categoriaDeIncidencia(tipo: string): CategoriaIncidencia | null {
  return (Object.entries(categoriasIncidencia).find(([, variedades]) => variedades.includes(tipo as never))?.[0] as CategoriaIncidencia | undefined) ?? null;
}

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
  estado: IncidentState;
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
  notas: (id: number, signal?: AbortSignal) => apiClient.get<{ items: IncidentNote[] }>(`/incidencias/${id}/notas`, { signal }),
  crear: (body: {
    envio_id: string;
    tipo: string;
    titulo?: string;
    descripcion: string;
    area_destino?: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
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

  cambiarEstado: (id: number, estado: IncidentState) =>
    apiClient.patch<Incidencia>(`/incidencias/${id}/estado`, { estado }),

  estado: (id: number, estado: IncidentState) =>
    apiClient.patch<Incidencia>(`/admin/incidencias/${id}`, { estado }),

  redirigir: (
    id: number,
    body: {
      area_destino: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
      id_terapeuta?: number | null;
    }
  ) => apiClient.patch<IncidenciaAdmin>(`/admin/incidencias/${id}/redirigir`, body),

  revocar: (id: number) =>
    apiClient.patch<Incidencia>(`/admin/incidencias/${id}/revocar`, {}),
};
