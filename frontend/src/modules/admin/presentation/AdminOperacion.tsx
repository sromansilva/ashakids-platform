import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RotateCw, Search, User, Settings, FileText, Calendar, Image as ImageIcon, CheckCircle, Clock, Info, CheckCircle2 } from 'lucide-react';
import { View } from '@/shared/domain/types/navigation';
import { Btn } from '@/shared/presentation/components/common/Btn';
import { incidenciasService, IncidenciaAdmin } from '@/modules/comunicacion/infrastructure/incidenciasService';

type FilterEstado = 'TODAS' | 'ABIERTA' | 'EN_REVISION' | 'RESUELTA';
type FilterRol = 'TODOS' | 'PADRE' | 'TERAPEUTA';

const demoIncidencias: any[] = [
  {
    id_incidencia: 101,
    codigo: 'INC-001',
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
    codigo: 'INC-002',
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
    codigo: 'INC-003',
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
    codigo: 'INC-004',
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
  const [items, setItems] = useState<any[]>([]);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<FilterEstado>('TODAS');
  const [filterRol, setFilterRol] = useState<FilterRol>('TODOS');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelected(null);
    setActionError('');

    incidenciasService.listar(0, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          if (Array.isArray(result.items)) {
            setItems(result.items.map((it, idx) => ({
              ...it,
              codigo: (it as { codigo?: string }).codigo || `INC-${String(idx + 1).padStart(3, '0')}`,
              tipo: it.tipo || 'Funcionalidad',
              estado: it.estado,
            })));
          } else {
            setItems([]);
          }
        }
      })
      .catch(cause => {
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

  const update = async (id: number, estado: 'LEIDA' | 'RESUELTA') => {
    setSaving(id);
    setActionError('');
    try {
      await incidenciasService.estado(id, estado);
      setItems(current => current.map(item =>
        item.id_incidencia === id
          ? { ...item, estado }
          : item
      ));
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo guardar el estado.');
    } finally {
      setSaving(null);
    }
  };

  const countAbiertas = items.filter(i => ['ABIERTA', 'NUEVA'].includes(i.estado)).length;
  const countEnRevision = items.filter(i => ['EN_REVISION', 'LEIDA'].includes(i.estado)).length;
  const countResueltas = items.filter(i => i.estado === 'RESUELTA').length;

  const filteredItems = items.filter(i => {
    if (filterEstado === 'ABIERTA' && !['ABIERTA', 'NUEVA'].includes(i.estado)) return false;
    if (filterEstado === 'EN_REVISION' && !['EN_REVISION', 'LEIDA'].includes(i.estado)) return false;
    if (filterEstado === 'RESUELTA' && i.estado !== 'RESUELTA') return false;
    if (filterRol === 'PADRE' && i.rol !== 'PADRE') return false;
    if (filterRol === 'TERAPEUTA' && i.rol !== 'TERAPEUTA') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        i.titulo.toLowerCase().includes(q) ||
        (i.codigo && i.codigo.toLowerCase().includes(q)) ||
        (i.descripcion && i.descripcion.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'reportes':
        return <FileText size={16} className="text-[#615274]" />;
      case 'reservas':
        return <Calendar size={16} className="text-[#615274]" />;
      case 'visualización':
      case 'visualizacion':
        return <ImageIcon size={16} className="text-[#615274]" />;
      default:
        return <Settings size={16} className="text-[#615274]" />;
    }
  };

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
            Incidencias
          </h1>
          <p className="text-sm sm:text-base text-[#615274] mt-2 font-medium">
            Reportes enviados por padres y terapeutas desde su formulario de incidencias.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-[#6B46FE] text-xs font-bold">
            <Clock size={13} />
            <span>Vista demostrativa · Datos de ejemplo</span>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => setReload(v => v + 1)}
            disabled={loading || saving !== null}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] cursor-pointer"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <div className="hidden md:block w-48 shrink-0">
            <img
              src="/illustrations/ashi-hero-v1.png"
              alt="Robot soporte"
              className="w-full h-auto object-contain max-h-36 drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] text-[#6B46FE] flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#615274]">Abiertas</p>
            <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countAbiertas}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#FF8A00] flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#615274]">En revisión</p>
            <p className="text-3xl font-black text-[#1C1135] mt-0.5 tabular-nums">{countEnRevision}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E5F4] shadow-sm flex items-center gap-4">
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
              { key: 'ABIERTA', label: 'Abiertas' },
              { key: 'EN_REVISION', label: 'En revisión' },
              { key: 'RESUELTA', label: 'Resueltas' },
            ] as const
          ).map(tab => (
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
          <div className="flex-1 w-full flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 shadow-sm">
            <Search size={17} className="text-[#8C82A8] shrink-0" />
            <input
              aria-label="Buscar incidencia"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar incidencia..."
              className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none"
            />
          </div>

          {/* Role select */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              aria-label="Filtrar por rol"
              value={filterRol}
              onChange={e => setFilterRol(e.target.value as FilterRol)}
              className="w-full appearance-none bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 pr-9 text-sm font-bold text-[#1C1135] shadow-sm cursor-pointer outline-none"
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

      {/* Incidencias Table */}
      <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#E8E5F4] bg-[#F8F7FD] text-xs font-extrabold text-[#615274]">
                <th className="py-4 px-6">Incidencia</th>
                <th className="py-4 px-6">Reportado por</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5F4] text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-bold text-[#615274]">
                    No hay incidencias en esta página
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                const isSelected = selected === item.id_incidencia;
                return (
                  <tr
                    key={item.id_incidencia}
                    className="hover:bg-[#F9F8FD] transition-colors"
                  >
                    {/* Incidencia */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-[#6B46FE] block mb-0.5">
                        {item.codigo || `INC-${item.id_incidencia}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelected(isSelected ? null : item.id_incidencia)}
                        className="font-extrabold text-sm text-[#1C1135] text-left hover:text-[#6B46FE] cursor-pointer"
                      >
                        {item.titulo}
                      </button>
                    </td>

                    {/* Reportado por */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[#615274] font-medium">
                        <User size={16} className="text-[#8C82A8]" />
                        <span>{item.rol === 'PADRE' ? 'Padre de familia' : 'Terapeuta'}</span>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-[#615274] font-medium">
                        {getTipoIcon(item.tipo)}
                        <span>{item.tipo}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      {['ABIERTA', 'NUEVA'].includes(item.estado) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                          {item.estado === 'NUEVA' ? 'Nueva' : 'Abierta'}
                        </span>
                      )}
                      {['EN_REVISION', 'LEIDA'].includes(item.estado) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          {item.estado === 'LEIDA' ? 'Leída' : 'En revisión'}
                        </span>
                      )}
                      {item.estado === 'RESUELTA' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                          Resuelta
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-[#615274] font-medium text-xs sm:text-sm">
                      {new Date(item.fecha_creacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelected(isSelected ? null : item.id_incidencia)}
                        className="inline-flex items-center gap-1 font-bold text-xs text-[#6B46FE] hover:text-[#5833EA] cursor-pointer"
                      >
                        Ver detalle
                        <ChevronRight size={14} className={isSelected ? 'rotate-90 transition-transform' : ''} />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Selected incident expanded detail */}
        {selected !== null && (() => {
          const item = items.find(i => i.id_incidencia === selected);
          if (!item) return null;
          return (
            <div className="p-6 bg-[#FAF9FE] border-t border-[#E8E5F4]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#1C1135] mb-1">
                    {item.codigo}: {item.titulo}
                  </h3>
                  <p className="text-xs text-[#615274] mb-3">
                    Reportado por {item.usuario} ({item.rol}) el {new Date(item.fecha_creacion).toLocaleString('es-PE')}
                  </p>
                  <p className="text-sm text-[#4B4264] leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {item.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.estado === 'ABIERTA' && (
                    <button
                      disabled={saving !== null}
                      onClick={() => update(item.id_incidencia, 'LEIDA')}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                    >
                      Poner en revisión
                    </button>
                  )}
                  {item.estado !== 'RESUELTA' && (
                    <button
                      disabled={saving !== null}
                      onClick={() => update(item.id_incidencia, 'RESUELTA')}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6B46FE] text-white hover:bg-[#5833EA] transition cursor-pointer shadow-sm"
                    >
                      {saving === item.id_incidencia ? 'Guardando…' : 'Marcar como resuelta'}
                    </button>
                  )}
                </div>
              </div>
              {actionError && <p role="alert" className="mt-2 text-xs text-red-600 font-bold">{actionError}</p>}
            </div>
          );
        })()}
      </div>

      {/* Bottom informational callout */}
      <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 flex items-center gap-3 text-sm text-[#6B46FE] font-bold">
        <Info size={18} className="shrink-0" />
        <span>Selecciona una incidencia para revisar el detalle y actualizar su estado.</span>
      </div>
    </section>
  );
}
