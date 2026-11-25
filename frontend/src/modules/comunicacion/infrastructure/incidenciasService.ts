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
    'Acceso a pacientes asignados',
    'Acceso a agenda y sesiones',
    'Permisos para reportes clínicos',
    'Acceso a herramientas terapéuticas',
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
const permisosPadre = opciones(['Cuentas y Permisos', 'Seguridad y Acceso'], {
  'Cuentas y Permisos': 'Acceso a mi cuenta y permisos familiares',
  'Seguridad y Acceso': 'Seguridad de mi cuenta',
});
const permisosTerapeuta = opciones([
  'Acceso a pacientes asignados',
  'Acceso a agenda y sesiones',
  'Permisos para reportes clínicos',
  'Acceso a herramientas terapéuticas',
  'Seguridad y Acceso',
], {
  'Acceso a pacientes asignados': 'No puedo abrir un paciente que tengo asignado',
  'Acceso a agenda y sesiones': 'No tengo permiso para consultar mi agenda o sesiones',
  'Permisos para reportes clínicos': 'No puedo crear o consultar reportes clínicos',
  'Acceso a herramientas terapéuticas': 'No puedo usar una herramienta de mi módulo',
  'Seguridad y Acceso': 'Seguridad de mi cuenta profesional',
});
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
    'Problemas de información': [],
  },
  ADMIN: {
    'Problemas técnicos': tecnicas,
    'Problemas de permisos': [],
    'Problemas de información': [],
  },
  SOPORTE_TECNICO: {
    'Problemas técnicos': [],
    'Problemas de permisos': opciones(['Cuentas y Permisos', 'Seguridad y Acceso'], {
      'Cuentas y Permisos': 'Solicitar o corregir permisos de una cuenta',
      'Seguridad y Acceso': 'Reportar un problema de acceso o seguridad',
    }),
    'Problemas de información': [],
  },
};

export function categoriasIncidenciaParaRol(rol: RolIncidencia): readonly CategoriaIncidencia[] {
  return (Object.keys(categoriasIncidencia) as CategoriaIncidencia[])
    .filter((categoria) => variedadesPorRol[rol][categoria].length > 0);
}

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
