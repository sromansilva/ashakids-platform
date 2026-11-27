import type { AuditoriaItem } from '@/modules/admin/infrastructure/adminService';
export type AuditCategory = 'all' | 'users' | 'patients' | 'other';
export const auditActions: Record<string, string> = {
  CREAR_PADRE: 'Creación de cuenta familiar',
  CREAR_TERAP: 'Creación de cuenta terapeuta',
  CREAR_SOP: 'Creación de cuenta soporte',
  ACTIVAR: 'Activación de cuenta',
  DESACTIVAR: 'Desactivación de cuenta',
  ELIMINAR: 'Eliminación de cuenta',
  CAMBIAR_ROL: 'Cambio de roles',
  UPDATE: 'Actualización de registro',
  REENVIAR_ACT: 'Reenvío de activación',
  APROBAR: 'Aprobación de solicitud',
  RECHAZAR: 'Rechazo de solicitud',
  VERIF_DNI: 'Verificación de DNI',
  // Acciones históricas / legado
  INSERT: 'Creación de registro',
  DELETE: 'Eliminación de registro',
  LOGIN: 'Inicio de sesión',
};

export function getAuditActionLabel(action: string): string {
  if (auditActions[action]) return auditActions[action];
  if (!action) return 'Operación del sistema';
  const clean = action.replace(/_/g, ' ').toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function auditCategory(table: string): Exclude<AuditCategory, 'all'> {
  const name = table.toLowerCase();
  if (['usuarios', 'tutores', 'terapeutas', 'usuario_roles', 'solicitudes_acceso_familia'].includes(name)) return 'users';
  if (['pacientes', 'expedientes', 'tratamientos'].includes(name)) return 'patients';
  return 'other';
}
export function auditDay(date: string): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date));
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function filterAudit(items: AuditoriaItem[], category: AuditCategory, search: string, from: string, to: string) {
  const needle = search.trim().toLocaleLowerCase();
  return items.filter(item => {
    const day = auditDay(item.fecha_evento);
    const actionLabel = getAuditActionLabel(item.accion);
    return (category === 'all' || auditCategory(item.nombre_tabla) === category)
      && (!from || day >= from) && (!to || day <= to)
      && `${item.actor ?? ''} ${item.nombre_tabla} ${item.nombre_entidad} ${actionLabel}`.toLocaleLowerCase().includes(needle);
  });
}
export function groupAudit(items: AuditoriaItem[]) {
  const days = new Map<string, AuditoriaItem[]>();
  [...items].sort((a,b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime() || b.id_auditoria - a.id_auditoria).forEach(item => {
    const day = auditDay(item.fecha_evento);
    days.set(day, [...(days.get(day) ?? []), item]);
  });
  return [...days];
}
