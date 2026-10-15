import type { AuditoriaItem } from '@/services/adminService';
export type AuditCategory = 'all' | 'users' | 'patients' | 'other';
export const auditActions: Record<string, string> = { INSERT: 'Creación de registro', UPDATE: 'Actualización de registro', DELETE: 'Eliminación de registro' };
export function auditCategory(table: string): Exclude<AuditCategory, 'all'> {
  const name = table.toLowerCase();
  if (['usuarios', 'tutores', 'terapeutas'].includes(name)) return 'users';
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
    return (category === 'all' || auditCategory(item.nombre_tabla) === category)
      && (!from || day >= from) && (!to || day <= to)
      && `${item.actor ?? ''} ${item.nombre_tabla} ${item.nombre_entidad} ${auditActions[item.accion] ?? item.accion}`.toLocaleLowerCase().includes(needle);
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
