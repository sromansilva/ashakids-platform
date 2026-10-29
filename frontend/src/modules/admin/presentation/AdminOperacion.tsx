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
import { AdminOperacionTable } from './AdminOperacionTable';

type FilterEstado = 'TODAS' | 'ABIERTA' | 'EN_REVISION' | 'RESUELTA';
type FilterRol = 'TODOS' | 'PADRE' | 'TERAPEUTA';

const demoIncidencias: any[] = [
  {
    id_incidencia: 101,
    codigo: 'INC-00001',
    titulo: 'El botón de guardar no responde',
    descripcion: 'Al intentar guardar los cambios en la sección de datos familiares, el botón se queda deshabilitado y no envía la petición.',
    usuario: 'Padre de familia',
    rol: 'PADRE',
    tipo: 'Funcionalidad',
    estado: 'ABIERTA',
    fecha_creacion: '2026-10-25T14:30:00Z',
  },
  {
    id_incidencia: 102,
    codigo: 'INC-00002',
    titulo: 'No puedo visualizar un reporte',
    descripcion: 'Al hacer clic en el reporte clínico de la sesión anterior no abre la vista previa del documento PDF.',
    usuario: 'Terapeuta',
    rol: 'TERAPEUTA',
    tipo: 'Reportes',
    estado: 'EN_REVISION',
    fecha_creacion: '2026-10-25T10:15:00Z',
  },
  {
    id_incidencia: 103,
    codigo: 'INC-00003',
    titulo: 'Dificultad para reservar una cita',
    descripcion: 'El calendario muestra horarios disponibles pero al seleccionar un turno marca error de sincronización.',
    usuario: 'Padre de familia',
    rol: 'PADRE',
    tipo: 'Reservas',
    estado: 'ABIERTA',
    fecha_creacion: '2026-10-24T18:45:00Z',
  },
  {
    id_incidencia: 104,
    codigo: 'INC-00004',
    titulo: 'Problema al cargar una imagen',
    descripcion: 'El avatar de perfil del niño arroja formato no soportado a pesar de ser un archivo PNG estándar.',
    usuario: 'Terapeuta',
    rol: 'TERAPEUTA',
    tipo: 'Visualización',
    estado: 'RESUELTA',
    fecha_creacion: '2026-10-24T09:20:00Z',
  },
];

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
  const [search, setSearch] = useState('');

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
          console.warn('[AdminOperacion] Using fallback mock data:', cause);
          setItems(demoIncidencias);
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

  const update = async (id: number, estado: 'LEIDA' | 'RESUELTA') => {
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

  const countAbiertas = items.filter((i) => ['ABIERTA', 'NUEVA', 'RECIBIDA'].includes(i.estado)).length;
  const countEnRevision = items.filter((i) => ['EN_REVISION', 'LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO'].includes(i.estado)).length;
  const countResueltas = items.filter((i) => ['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(i.estado)).length;

  const filteredItems = items.filter((i) => {
    if (filterEstado === 'ABIERTA' && !['ABIERTA', 'NUEVA', 'RECIBIDA'].includes(i.estado)) return false;
    if (filterEstado === 'EN_REVISION' && !['EN_REVISION', 'LEIDA', 'LEÍDA', 'EN PROCESO', 'EN_PROCESO'].includes(i.estado)) return false;
    if (filterEstado === 'RESUELTA' && !['RESUELTA', 'SOLUCIONADA', 'ATENDIDA'].includes(i.estado)) return false;
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
    return true;
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
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
                <p className="text-xs font-bold text-[#615274]">Abiertas / Recibidas</p>
                <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countAbiertas}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#FF8A00] flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">En revisión / Proceso</p>
                <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countEnRevision}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6FFFA] text-[#00A389] flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#615274]">Resueltas / Atendidas</p>
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
                  { key: 'ABIERTA', label: 'Abiertas' },
                  { key: 'EN_REVISION', label: 'En revisión' },
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

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-xl justify-end">
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
              {error}
            </div>
          )}

          {/* Incidencias Table Subcomponent */}
          <AdminOperacionTable
            items={filteredItems}
            allItems={items}
            selected={selected}
            setSelected={setSelected}
            onUpdateEstado={update}
            saving={saving}
            actionError={actionError}
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
