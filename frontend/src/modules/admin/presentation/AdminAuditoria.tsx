import { useEffect, useState } from "react";
import { AlertTriangle, FilePlus2, FileText, Layers, Pencil, RefreshCw, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { adminService, type AuditoriaItem } from "@/modules/admin/infrastructure/adminService";
import { ApiError } from "@/core/api/client";
import { auditActions, auditCategory, auditDay, filterAudit, groupAudit, type AuditCategory } from './auditView';

const categories: { value: AuditCategory; label: string; icon: typeof Users }[] = [
  { value: 'all', label: 'Todos', icon: Layers },
  { value: 'users', label: 'Usuarios', icon: Users },
  { value: 'patients', label: 'Pacientes', icon: FileText },
  { value: 'other', label: 'Otros módulos', icon: ShieldCheck },
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
    setLoading(true);
    setError('');
    adminService.getAuditoria().then(result => {
      if (active) {
        setItems(result.items);
        setTotal(result.total);
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof ApiError && cause.status === 403
        ? 'No tienes permiso para consultar estos registros.' : 'No se pudo cargar el registro. Intenta nuevamente.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [revision]);

  const invalidRange = !!from && !!to && from > to;
  const filtered = invalidRange ? [] : filterAudit(items, category, search, from, to);
  const groups = groupAudit(filtered);
  const reset = () => { setCategory('all'); setSearch(''); setFrom(''); setTo(''); };

  const stats = [
    { label: 'Total de eventos', value: total, icon: FileText, bg: 'bg-[#F3E8FF]', color: 'text-[#6B46FE]', note: 'En el sistema' },
    { label: 'Creaciones', value: items.filter(i => i.accion === 'INSERT').length, icon: FilePlus2, bg: 'bg-[#E6FFFA]', color: 'text-[#00A389]', note: 'En los eventos cargados' },
    { label: 'Actualizaciones', value: items.filter(i => i.accion === 'UPDATE').length, icon: Pencil, bg: 'bg-[#FFF4E5]', color: 'text-[#FF8A00]', note: 'En los eventos cargados' },
    { label: 'Eliminaciones', value: items.filter(i => i.accion === 'DELETE').length, icon: Trash2, bg: 'bg-[#FEE2E2]', color: 'text-[#EF4444]', note: 'En los eventos cargados' },
  ];

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
            Auditoría y seguridad
          </h1>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Consulta quién realizó cada operación y cuándo.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => setRevision(v => v + 1)}
            className="mt-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar eventos
          </button>
        </div>
        <div className="hidden md:block w-48 lg:w-56 shrink-0 z-10">
          <img
            src="/illustrations/step-account-v54.png"
            alt="Auditoría ilustración"
            className="w-full h-auto object-contain max-h-40 drop-shadow-md"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#615274]">{s.label}</p>
              <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">
                {loading || error ? '—' : s.value}
              </p>
              <p className="text-[11px] text-[#8C82A8] mt-0.5 font-medium">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Filter Pills */}
      <div className="inline-flex flex-wrap rounded-2xl border border-[#E8E5F4] bg-white p-1 gap-1 shadow-sm mb-4">
        {categories.map(option => {
          const count = loading || error ? 0 : option.value === 'all' ? items.length : items.filter(item => auditCategory(item.nombre_tabla) === option.value).length;
          const active = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                active
                  ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
                  : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
              }`}
            >
              <option.icon size={15} />
              <span>{option.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#615274]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={18} className="text-[#8C82A8] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar eventos por actor, registro o acción"
            placeholder="Buscar actor, registro o acción..."
            className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-3 py-2 shadow-sm text-xs font-bold text-[#615274]">
            <span>Desde</span>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1C1135] outline-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-3 py-2 shadow-sm text-xs font-bold text-[#615274]">
            <span>Hasta</span>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1C1135] outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {invalidRange && (
        <p className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-bold border border-red-200 mb-4" role="alert">
          La fecha inicial debe ser anterior o igual a la fecha final.
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-12 text-center text-[#615274] font-bold text-sm">
          Cargando eventos…
        </div>
      ) : error ? (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-900 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setRevision(v => v + 1)}
            className="px-4 py-2 rounded-xl bg-white border border-red-200 font-bold text-xs text-red-800 hover:bg-red-100 transition"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-bold text-[#615274] mb-3" role="status">
            {filtered.length} eventos visibles de {items.length} cargados
            {total > items.length ? ` · ${total} en el sistema. Se consultan los 100 más recientes.` : ''}
          </p>

          {!groups.length ? (
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-12 text-center shadow-sm">
              <ShieldCheck size={36} className="mx-auto text-violet-600 mb-3" />
              <h2 className="text-base font-extrabold text-[#1C1135]">
                {items.length ? 'No hay eventos con estos filtros' : 'Todavía no hay operaciones registradas'}
              </h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 px-4 py-2 rounded-xl bg-violet-50 text-[#6B46FE] font-bold text-xs hover:bg-violet-100 transition"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(([day, events]) => (
                <section
                  className="bg-white border border-[#E8E5F4] rounded-3xl p-6 shadow-sm"
                  key={day}
                  aria-label={dayTitle(day)}
                >
                  <header className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#E8E5F4]">
                    <h2 className="text-sm font-extrabold text-[#1C1135]">{dayTitle(day)}</h2>
                    <span className="text-xs font-bold text-[#8C82A8]">
                      {events.length} {events.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  </header>

                  <ol className="space-y-3">
                    {events.map(item => {
                      const Icon = actions[item.accion as keyof typeof actions] ?? FileText;
                      const module = auditCategory(item.nombre_tabla);
                      return (
                        <li key={item.id_auditoria} className="flex items-start gap-4 p-3.5 rounded-2xl bg-[#F9F8FD] border border-[#E8E5F4]/80">
                          {/* Time */}
                          <time className="w-20 pt-1 text-xs font-mono font-bold text-[#615274] shrink-0">
                            {new Intl.DateTimeFormat('es-PE', {
                              timeZone: 'America/Lima',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(item.fecha_evento))}
                          </time>

                          {/* Event Icon badge */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.accion === 'INSERT'
                              ? 'bg-[#E6FFFA] text-[#00A389]'
                              : item.accion === 'UPDATE'
                              ? 'bg-[#FFF4E5] text-[#FF8A00]'
                              : 'bg-[#FEE2E2] text-[#EF4444]'
                          }`}>
                            <Icon size={18} />
                          </div>

                          {/* Event Body */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-extrabold text-[#1C1135]">
                                  {auditActions[item.accion] ?? item.accion}
                                </h3>
                                <p className="text-xs text-[#615274] mt-0.5 font-medium">
                                  Actor: <strong className="text-[#1C1135]">{item.actor ?? 'Administrador Sistema'}</strong>
                                </p>
                                <p className="text-[11px] text-[#8C82A8] mt-0.5">
                                  {item.nombre_tabla} · Registro {item.nombre_entidad}
                                </p>
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                                module === 'patients'
                                  ? 'bg-[#E6FFFA] text-[#00A389]'
                                  : module === 'users'
                                  ? 'bg-[#F3E8FF] text-[#6B46FE]'
                                  : 'bg-gray-100 text-[#615274]'
                              }`}>
                                {moduleLabels[module]}
                              </span>
                            </div>

                            <details className="mt-2 text-xs text-[#615274]">
                              <summary className="cursor-pointer font-bold text-[#6B46FE] hover:underline">
                                Ver detalle
                              </summary>
                              <div className="mt-2 p-3 bg-white rounded-xl border border-[#E8E5F4] flex flex-wrap gap-4 text-xs">
                                <div><span className="font-bold">ID Evento:</span> #{item.id_auditoria}</div>
                                <div><span className="font-bold">Acción:</span> {item.accion}</div>
                                <div><span className="font-bold">Fecha / Hora:</span> {new Date(item.fecha_evento).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</div>
                              </div>
                            </details>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
export default AdminAuditoria;
