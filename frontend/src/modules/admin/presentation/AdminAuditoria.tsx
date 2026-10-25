import { useEffect, useState } from "react";
import { AlertTriangle, FilePlus2, FileText, Layers, Pencil, RefreshCw, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { adminService, type AuditoriaItem } from "@/modules/admin/infrastructure/adminService";
import { ApiError } from "@/core/api/client";
import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { auditActions, auditCategory, auditDay, filterAudit, groupAudit, type AuditCategory } from './auditView';
import './audit.css';

const categories: { value: AuditCategory; label: string; icon: typeof Users }[] = [
  { value: 'all', label: 'Todos', icon: Layers }, { value: 'users', label: 'Usuarios', icon: Users },
  { value: 'patients', label: 'Pacientes', icon: FileText }, { value: 'other', label: 'Otros módulos', icon: ShieldCheck },
];
const moduleLabels = { users: 'Usuarios', patients: 'Pacientes', other: 'Otros módulos' };
const actions = { INSERT: FilePlus2, UPDATE: Pencil, DELETE: Trash2 };
function dayTitle(day: string) {
  const today = auditDay(new Date().toISOString());
  const yesterday = auditDay(new Date(Date.now() - 86400000).toISOString());
  const date = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${day}T12:00:00-05:00`));
  return `${day === today ? 'Hoy, ' : day === yesterday ? 'Ayer, ' : ''}${date}`;
}

export function AdminAuditoria() {
  const [items, setItems] = useState<AuditoriaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [category, setCategory] = useState<AuditCategory>('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    adminService.getAuditoria().then(result => {
      if (active) { setItems(result.items); setTotal(result.total); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof ApiError && cause.status === 403
        ? 'No tienes permiso para consultar estos registros.' : 'No se pudo cargar el registro. Intenta nuevamente.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const invalidRange = !!from && !!to && from > to;
  const filtered = invalidRange ? [] : filterAudit(items, category, search, from, to);
  const groups = groupAudit(filtered);
  const reset = () => { setCategory('all'); setSearch(''); setFrom(''); setTo(''); };
  const stats = [
    { label: 'Total de eventos', value: total, icon: FileText, tone: 'violet', note: 'En el sistema' },
    { label: 'Creaciones', value: items.filter(i => i.accion === 'INSERT').length, icon: FilePlus2, tone: 'teal', note: 'En los eventos cargados' },
    { label: 'Actualizaciones', value: items.filter(i => i.accion === 'UPDATE').length, icon: Pencil, tone: 'orange', note: 'En los eventos cargados' },
    { label: 'Eliminaciones', value: items.filter(i => i.accion === 'DELETE').length, icon: Trash2, tone: 'red', note: 'En los eventos cargados' },
  ];
  return <section className="admin-audit p-4 sm:p-6 max-w-6xl mx-auto">
    <header className="audit-heading">
      <div><h1>Auditoría y seguridad</h1><p>Consulta quién realizó cada operación y cuándo.</p>
        <button className="audit-refresh" type="button" disabled={loading} onClick={() => setRevision(value => value + 1)}><RefreshCw size={16} aria-hidden="true"/>Actualizar eventos</button>
      </div>
      <div className="audit-art" aria-hidden="true"><ShieldCheck size={42}/><PublicIllustration src="/illustrations/team-care-v54.png" alt="" width={160} height={160}/></div>
    </header>
    <dl className="audit-stats">{stats.map(stat => { const Icon = stat.icon; return <div key={stat.label} className={`audit-stat audit-tone-${stat.tone}`}>
      <span className="audit-icon"><Icon size={23} aria-hidden="true"/></span><div><dt>{stat.label}</dt><dd>{loading || error ? '—' : stat.value}</dd><p>{stat.note}</p></div>
    </div>; })}</dl>
    <div className="audit-controls">
      <div className="audit-categories" role="group" aria-label="Filtrar por módulo">{categories.map(option => { const Icon = option.icon; return <button key={option.value} type="button" aria-pressed={category === option.value} onClick={() => setCategory(option.value)}>
        <Icon size={16} aria-hidden="true"/>{option.label}<span>{loading || error ? '—' : option.value === 'all' ? items.length : items.filter(item => auditCategory(item.nombre_tabla) === option.value).length}</span>
      </button>; })}</div>
      <div className="audit-filter-fields">
        <label className="audit-search"><span className="sr-only">Buscar eventos por actor, registro o acción</span><Search size={17} aria-hidden="true"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar actor, registro o acción…"/></label>
        <label>Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)}/></label>
        <label>Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)}/></label>
      </div>
    </div>
    {invalidRange && <p className="audit-error" role="alert">La fecha inicial debe ser anterior o igual a la fecha final.</p>}
    {loading ? <p className="audit-empty" role="status">Cargando eventos…</p> : error ? <div className="audit-error" role="alert"><AlertTriangle size={20} aria-hidden="true"/><p>{error}</p><button type="button" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div> : <>
      <p className="audit-results" role="status">{filtered.length} eventos visibles de {items.length} cargados{total > items.length ? ` · ${total} en el sistema. Se consultan los 100 más recientes.` : ''}</p>
      {!groups.length ? <div className="audit-empty"><ShieldCheck size={28} aria-hidden="true"/><h2>{items.length ? 'No hay eventos con estos filtros' : 'Todavía no hay operaciones registradas'}</h2>{items.length > 0 && <button type="button" onClick={reset}>Limpiar filtros</button>}</div> : <div className="audit-timeline">
        {groups.map(([day, events]) => <section className="audit-day" key={day} aria-label={dayTitle(day)}><header><h2>{dayTitle(day)}</h2><span>{events.length} {events.length === 1 ? 'evento' : 'eventos'}</span></header>
          <ol>{events.map(item => { const Icon = actions[item.accion as keyof typeof actions] ?? FileText; const module = auditCategory(item.nombre_tabla); return <li key={item.id_auditoria}>
            <time dateTime={item.fecha_evento}>{new Intl.DateTimeFormat('es-PE', {timeZone:'America/Lima',hour:'2-digit',minute:'2-digit'}).format(new Date(item.fecha_evento))}</time>
            <article className={`audit-event audit-action-${item.accion.toLowerCase()}`}><span className="audit-event-icon"><Icon size={20} aria-hidden="true"/></span>
              <div className="audit-event-copy"><h3>{auditActions[item.accion] ?? item.accion}</h3><p>Actor: <strong>{item.actor ?? 'Cuenta eliminada'}</strong></p><p>{item.nombre_tabla} · Registro {item.nombre_entidad}</p></div>
              <span className={`audit-module audit-module-${module}`}>{moduleLabels[module]}</span>
              <details><summary>Ver detalle</summary><dl><div><dt>Evento</dt><dd>#{item.id_auditoria}</dd></div><div><dt>Acción</dt><dd>{item.accion}</dd></div><div><dt>Fecha y hora · Lima</dt><dd>{new Date(item.fecha_evento).toLocaleString('es-PE',{timeZone:'America/Lima'})}</dd></div></dl></details>
            </article>
          </li>; })}</ol>
        </section>)}
      </div>}
    </>}
  </section>;
}
