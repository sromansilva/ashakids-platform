import { useEffect, useState } from 'react';
import {
  ChevronDown,
  RotateCw,
  Search,
  FileText,
  Clock,
  Info,
  CheckCircle2,
  Inbox,
  Send,
  History,
  ShieldCheck,
} from 'lucide-react';
import { View } from '@/shared/domain/types/navigation';
import { incidenciasService, Incidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { IncidentsTable } from '@/shared/presentation/components/common/IncidentsTable';
import { IncidentDateRangeFilter } from '@/shared/presentation/components/common/IncidentDateRangeFilter';
import { AdminOperacionTable } from './AdminOperacionTable';

type FilterEstado = 'TODAS' | 'RECIBIDA' | 'EN ATENCIÓN' | 'RESUELTA';
type FilterRol = 'TODOS' | 'PADRE' | 'TERAPEUTA';

export function AdminOperacion({ go: _go }: { go: (v: View) => void }) {
  const [adminTab, setAdminTab] = useState<'RECIBIDAS' | 'ENVIAR' | 'HISTORIAL'>('RECIBIDAS');
  const [items, setItems] = useState<any[]>([]);
  const [enviadas, setEnviadas] = useState<Incidencia[]>([]);
  const [loadingEnviadas, setLoadingEnviadas] = useState(false);

  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('TODAS');
  const [filterRol, setFilterRol] = useState<FilterRol>('TODOS');
  const [filterArea, setFilterArea] = useState('TODAS');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Cargar incidencias recibidas por administración
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelected(null);
    setActionError('');

    incidenciasService
      .listar(0, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          if (Array.isArray(result.items)) {
            setItems(
              result.items.map((it, idx) => ({
                ...it,
                codigo: (it as { codigo?: string; ticket?: string }).ticket || (it as { codigo?: string }).codigo || `INC-${String(idx + 1).padStart(5, '0')}`,
                titulo: it.titulo || it.tipo,
                tipo: it.tipo || 'Funcionalidad',
                estado: it.estado,
              }))
            );
          } else {
            setItems([]);
          }
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          console.warn('[AdminOperacion] Error al cargar incidencias:', cause);
          setItems([]);
          setError('No se pudieron cargar las incidencias.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reload]);

  // Cargar solicitudes que admin envió a Soporte Técnico
  const loadEnviadas = () => {
    setLoadingEnviadas(true);
    incidenciasService
      .misIncidencias()
      .then((res) => {
        setEnviadas(res.items || []);
      })
      .catch((err) => {
        console.warn('[AdminOperacion] Error cargando enviadas:', err);
        setEnviadas([]);
      })
      .finally(() => setLoadingEnviadas(false));
  };

  useEffect(() => {
    if (adminTab === 'HISTORIAL') {
      loadEnviadas();
    }
  }, [adminTab]);

  const update = async (id: number, estado: 'EN ATENCIÓN' | 'RESUELTA') => {
    setSaving(id);
    setActionError('');
    try {
      await incidenciasService.estado(id, estado);
      setItems((current) =>
        current.map((item) =>
          item.id_incidencia === id ? { ...item, estado } : item
        )
      );
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo guardar el estado.');
    } finally {
      setSaving(null);
    }
  };

  const countAbiertas = items.filter((i) => i.estado === 'RECIBIDA').length;
  const countEnRevision = items.filter((i) => i.estado === 'EN ATENCIÓN').length;
  const countResueltas = items.filter((i) => i.estado === 'RESUELTA').length;

  const filteredItems = items.filter((i) => {
    if (filterEstado === 'RECIBIDA' && !['ABIERTA', 'NUEVA', 'RECIBIDA'].includes(i.estado)) return false;
    if (filterEstado === 'EN ATENCIÓN' && !['EN_REVISION', 'LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO', 'EN ATENCIÓN'].includes(i.estado)) return false;
    if (filterEstado === 'RESUELTA' && !['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(i.estado)) return false;
    if (filterArea !== 'TODAS' && i.area_destino !== filterArea) return false;
    if (filterRol === 'PADRE' && i.rol !== 'PADRE') return false;
    if (filterRol === 'TERAPEUTA' && i.rol !== 'TERAPEUTA') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (i.titulo && i.titulo.toLowerCase().includes(q)) ||
        (i.codigo && i.codigo.toLowerCase().includes(q)) ||
        (i.ticket && i.ticket.toLowerCase().includes(q)) ||
        (i.descripcion && i.descripcion.toLowerCase().includes(q)) ||
        (i.usuario && i.usuario.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const itemDate = new Date(i.fecha_creacion);
      if (!isNaN(itemDate.getTime()) && itemDate < start) return false;
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);
      const itemDate = new Date(i.fecha_creacion);
      if (!isNaN(itemDate.getTime()) && itemDate > end) return false;
    }
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const timeA = a.fecha_creacion ? new Date(a.fecha_creacion).getTime() : 0;
    const timeB = b.fecha_creacion ? new Date(b.fecha_creacion).getTime() : 0;
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-[#6B46FE] text-xs font-black mb-2">
            <ShieldCheck size={14} /> Panel Administrativo
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">Incidencias y Soporte</h1>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Gestión de solicitudes administrativas recibidas de familias y terapeutas, y reporte directo a Soporte Técnico.
          </p>
        </div>

        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => setReload((v) => v + 1)}
            disabled={loading || saving !== null}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer"
          >
            <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
          <div className="hidden md:block w-48 shrink-0">
            <img
              src="/illustrations/ashi-hero-v1.png"
              alt="Robot soporte"
              className="w-full h-auto object-contain max-h-36 drop-shadow-md select-none"
            />
          </div>
        </div>
      </div>

      {/* Navegación de 3 Pestañas de Administración */}
      <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-[#E8E5F4] shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setAdminTab('RECIBIDAS')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all ${
            adminTab === 'RECIBIDAS'
              ? 'bg-[#6B46FE] text-white shadow-xs'
              : 'text-[#615274] hover:bg-[#F0EEF8]'
          }`}
        >
          <Inbox size={15} /> Incidencias recibidas ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('ENVIAR')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all ${
            adminTab === 'ENVIAR'
              ? 'bg-[#6B46FE] text-white shadow-xs'
              : 'text-[#615274] hover:bg-[#F0EEF8]'
          }`}
        >
          <Send size={15} /> Enviar incidencia a Soporte Técnico
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('HISTORIAL')}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all ${
            adminTab === 'HISTORIAL'
              ? 'bg-[#6B46FE] text-white shadow-xs'
              : 'text-[#615274] hover:bg-[#F0EEF8]'
          }`}
        >
          <History size={15} /> Mis solicitudes enviadas {enviadas.length > 0 ? `(${enviadas.length})` : ''}
        </button>
      </div>

      {/* Pestaña 1: BANDEJA DE RECIBIDAS (Gestión de administración) */}
      {adminTab === 'RECIBIDAS' && (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Recibidas</p>
                <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countAbiertas}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#FF8A00] flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">En atención</p>
                <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countEnRevision}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6FFFA] text-[#00A389] flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Resueltas</p>
                <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countResueltas}</p>
              </div>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
            {/* Status Filter Pills */}
            <div className="grid w-4/5 grid-cols-2 sm:flex sm:w-fit rounded-2xl border border-[#E8E5F4] bg-white p-1 gap-1 shadow-sm shrink-0">
              {(
                [
                  { key: 'TODAS', label: 'Todas' },
                  { key: 'RECIBIDA', label: 'Recibidas' },
                  { key: 'EN ATENCIÓN', label: 'En atención' },
                  { key: 'RESUELTA', label: 'Resueltas' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterEstado(tab.key)}
                  className={`w-full min-w-0 sm:w-auto text-center px-1 sm:px-5 py-2 rounded-xl text-xs sm:text-sm leading-tight font-extrabold transition-all cursor-pointer ${
                    filterEstado === tab.key
                      ? 'bg-[#6B46FE] text-white shadow-md shadow-violet-200'
                      : 'text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-2xl justify-end">
              {/* Search box */}
              <div className="flex-1 w-full flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 shadow-2xs">
                <Search size={17} className="text-[#8C82A8] shrink-0" />
                <input
                  aria-label="Buscar incidencia"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar incidencia..."
                  className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none"
                />
              </div>

              {/* Dynamic Date Range Filter beside search */}
              <IncidentDateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
              />

              {/* Area select */}
              <select
                aria-label="Filtrar por área"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="rounded-2xl border border-[#E8E5F4] bg-white px-4 py-2.5 text-sm font-bold text-[#1C1135] shadow-2xs"
              >
                <option value="TODAS">Todas las áreas</option>
                <option value="ADMINISTRACION">Administración</option>
                <option value="SOPORTE_TECNICO">Soporte técnico</option>
              </select>
              {/* Role select */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <select
                  aria-label="Filtrar por rol"
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value as FilterRol)}
                  className="w-full appearance-none bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 pr-9 text-sm font-bold text-[#1C1135] shadow-2xs cursor-pointer outline-none"
                >
                  <option value="TODOS">Todos los roles</option>
                  <option value="PADRE">Padre de familia</option>
                  <option value="TERAPEUTA">Terapeuta</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-[#8C82A8] pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-5 mb-6 text-red-900 font-bold">
              {error} <button type="button" onClick={() => setReload((v) => v + 1)} className="underline">Reintentar</button>
            </div>
          )}

          {/* Incidencias Table Subcomponent */}
          <AdminOperacionTable
            items={sortedItems}
            allItems={items}
            selected={selected}
            setSelected={setSelected}
            onUpdateEstado={update}
            saving={saving}
            actionError={actionError}
            sortOrder={sortOrder}
            onToggleSort={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
          />

          {/* Bottom informational callout */}
          <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 flex items-center gap-3 text-sm text-[#6B46FE] font-bold">
            <Info size={18} className="shrink-0" />
            <span>Selecciona una incidencia para revisar el detalle y actualizar su estado.</span>
          </div>
        </>
      )}

      {/* Pestaña 2: ENVIAR A SOPORTE TÉCNICO */}
      {adminTab === 'ENVIAR' && (
        <div className="space-y-6">
          <IncidentForm
            role="ADMIN"
            submitButtonText="Enviar a soporte técnico"
            title="Enviar reporte a Soporte Técnico"
            subtitle="Registra anomalías en la infraestructura, fallos de guardado o problemas técnicos de la plataforma."
            onSuccess={() => {
              loadEnviadas();
            }}
          />
        </div>
      )}

      {/* Pestaña 3: HISTORIAL DE SOLICITUDES ENVIADAS POR ADMIN */}
      {adminTab === 'HISTORIAL' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E5F4] p-5 shadow-2xs">
            <h2 className="text-base font-black text-[#1C1135]">Solicitudes enviadas a Soporte Técnico</h2>
            <p className="text-xs text-[#6B5E8A] font-medium mt-0.5">
              Historial de incidencias técnicas remitidas por administración hacia el equipo de soporte.
            </p>
          </div>

          <IncidentsTable
            items={enviadas}
            loading={loadingEnviadas}
            onRefresh={loadEnviadas}
            canUpdateStatus={false}
            isReceivedView={false}
            emptyMessage="Administración no ha emitido solicitudes a Soporte Técnico."
          />
        </div>
      )}
    </section>
  );
}
