import { useEffect, useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRightLeft,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  incidenciasService,
  type IncidenciaAdmin,
  type TerapeutaOption,
} from '@/modules/comunicacion/infrastructure/incidenciasService';
import { IncidentThread } from '@/shared/presentation/components/common/IncidentThread';

interface AdminIncidentDetailModalProps {
  item: IncidenciaAdmin | null;
  onClose: () => void;
  onUpdateEstado: (id: number, estado: 'EN ATENCIÓN' | 'RESUELTA') => Promise<void>;
  onRedirigir: (
    id: number,
    nuevaArea: 'ADMINISTRACION' | 'SOPORTE_TECNICO' | 'TERAPEUTA',
    idTerapeuta?: number | null
  ) => Promise<void>;
  onRevocar: (id: number) => Promise<void>;
  saving: number | null;
  actionError: string;
}

export function AdminIncidentDetailModal({
  item,
  onClose,
  onUpdateEstado,
  onRedirigir,
  onRevocar,
  saving,
  actionError,
}: AdminIncidentDetailModalProps) {
  const [showRedirect, setShowRedirect] = useState(false);
  const [targetArea, setTargetArea] = useState<'ADMINISTRACION' | 'SOPORTE_TECNICO' | 'TERAPEUTA'>('ADMINISTRACION');
  const [targetTerapeutaId, setTargetTerapeutaId] = useState<number | null>(null);
  const [terapeutas, setTerapeutaList] = useState<TerapeutaOption[]>([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);

  useEffect(() => {
    if (item) {
      setShowRedirect(false);
      setTargetArea(item.area_destino || 'ADMINISTRACION');
      setTargetTerapeutaId(item.id_terapeuta || null);
    }
  }, [item]);

  useEffect(() => {
    if (showRedirect && targetArea === 'TERAPEUTA' && terapeutas.length === 0) {
      setLoadingTerapeutas(true);
      incidenciasService
        .terapeutasRelacionados()
        .then((res) => {
          const list = res.disponibles?.length ? res.disponibles : res.previos || [];
          setTerapeutaList(list);
          if (!targetTerapeutaId && list.length > 0) {
            setTargetTerapeutaId(list[0].id_terapeuta);
          }
        })
        .catch(() => setTerapeutaList([]))
        .finally(() => setLoadingTerapeutas(false));
    }
  }, [showRedirect, targetArea, terapeutas.length, targetTerapeutaId]);

  if (!item) return null;

  const isSavingThis = saving === item.id_incidencia;

  // Lógica del límite estricto de 2 días (48 horas) para revocación
  const fechaBase = item.fecha_actualizacion
    ? new Date(item.fecha_actualizacion).getTime()
    : new Date(item.fecha_creacion).getTime();
  const msTranscurridos = Date.now() - fechaBase;
  const dosDiasEnMs = 2 * 24 * 60 * 60 * 1000;
  const puedeRevocar = item.estado === 'RESUELTA' && msTranscurridos <= dosDiasEnMs;
  const diasTranscurridos = Math.floor(msTranscurridos / (24 * 60 * 60 * 1000));

  const handleConfirmRedirect = async () => {
    await onRedirigir(item.id_incidencia, targetArea, targetArea === 'TERAPEUTA' ? targetTerapeutaId : null);
    setShowRedirect(false);
  };

  const getAreaLabel = () => {
    if (item.area_destino === 'SOPORTE_TECNICO') return 'Soporte Técnico';
    if (item.area_destino === 'TERAPEUTA') {
      return item.terapeuta_nombre ? `Terapeuta: ${item.terapeuta_nombre}` : 'Terapeuta';
    }
    return 'Administración';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl border border-[#E8E5F4] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#E8E5F4] flex items-center justify-between bg-[#FAF9FD]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#6B46FE]">
                {item.codigo || item.ticket || `INC-${item.id_incidencia}`}
              </span>
              <span className="text-xs text-[#8C82A8] font-bold">·</span>
              <span className="text-xs font-black text-[#615274]">{item.tipo}</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#1C1135] mt-0.5">{item.titulo || item.tipo}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-white border border-[#E8E5F4] text-[#615274] hover:text-[#1C1135] hover:bg-[#F3E8FF] flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status, Priority & Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {item.estado === 'RECIBIDA' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FEE2E2] text-[#DC2626]">
                <AlertCircle size={13} /> RECIBIDA
              </span>
            )}
            {item.estado === 'EN ATENCIÓN' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FEF3C7] text-[#D97706]">
                <Clock size={13} /> EN ATENCIÓN
              </span>
            )}
            {item.estado === 'RESUELTA' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D1FAE5] text-[#059669]">
                <CheckCircle2 size={13} /> RESUELTA
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#EDE9FE] text-[#6B46FE]">
              Área: {getAreaLabel()}
            </span>

            <span className="text-xs font-bold text-[#8C82A8] ml-auto">
              Registrado el{' '}
              {new Date(item.fecha_creacion).toLocaleString('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          {/* Información del solicitante y área */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl border border-[#E8E5F4] bg-[#FAF9FE] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#6B46FE] flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#8C82A8] uppercase">Reportado por</span>
                <p className="font-extrabold text-[#1C1135] text-sm">{item.usuario || item.solicitante || 'Usuario'}</p>
                <p className="text-[#615274] font-medium">{item.rol === 'PADRE' ? 'Padre de familia' : 'Terapeuta'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#E8E5F4] bg-[#FAF9FE] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#6B46FE] flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#8C82A8] uppercase">Destino actual</span>
                <p className="font-extrabold text-[#1C1135] text-sm">{getAreaLabel()}</p>
                <p className="text-[#615274] font-medium">Clave: {item.area_destino || 'ADMINISTRACION'}</p>
              </div>
            </div>
          </div>

          {/* Solicitud / Descripción */}
          <div className="bg-[#FAF9FE] rounded-2xl p-4 border border-[#E8E5F4]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#615274] mb-1.5">
              Descripción del reporte:
            </h4>
            <p className="text-sm text-[#1C1135] leading-relaxed whitespace-pre-wrap font-medium">
              {item.descripcion || 'Sin descripción detallada.'}
            </p>
          </div>

          {/* Panel de Redirección (si se activa) */}
          {showRedirect && (
            <div className="p-4 rounded-2xl border-2 border-[#6B46FE]/30 bg-[#F5F3FF] space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-[#6B46FE]" />
                  <h4 className="text-xs font-black text-[#1C1135] uppercase tracking-wider">
                    Redirigir reporte a otra área
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRedirect(false)}
                  className="text-xs font-bold text-[#615274] hover:text-[#1C1135]"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#615274] mb-1">Área de destino</label>
                  <select
                    value={targetArea}
                    onChange={(e) =>
                      setTargetArea(e.target.value as 'ADMINISTRACION' | 'SOPORTE_TECNICO' | 'TERAPEUTA')
                    }
                    className="w-full bg-white border border-[#E8E5F4] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1135] outline-none"
                  >
                    <option value="ADMINISTRACION">Administración</option>
                    <option value="SOPORTE_TECNICO">Soporte Técnico</option>
                    <option value="TERAPEUTA">Terapeuta</option>
                  </select>
                </div>

                {targetArea === 'TERAPEUTA' && (
                  <div>
                    <label className="block text-xs font-bold text-[#615274] mb-1">Seleccionar Terapeuta</label>
                    <select
                      value={targetTerapeutaId || ''}
                      onChange={(e) => setTargetTerapeutaId(e.target.value ? Number(e.target.value) : null)}
                      disabled={loadingTerapeutas}
                      className="w-full bg-white border border-[#E8E5F4] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1135] outline-none"
                    >
                      {loadingTerapeutas ? (
                        <option value="">Cargando terapeutas…</option>
                      ) : terapeutas.length === 0 ? (
                        <option value="">No hay terapeutas disponibles</option>
                      ) : (
                        terapeutas.map((t) => (
                          <option key={t.id_terapeuta} value={t.id_terapeuta}>
                            {t.nombre} ({t.especialidad})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isSavingThis}
                  onClick={handleConfirmRedirect}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#6B46FE] hover:bg-[#5833EA] text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} /> Confirmar redirección
                </button>
              </div>
            </div>
          )}

          {/* Mensajes / Hilo de notas técnicas */}
          <IncidentThread id={item.id_incidencia} load={incidenciasService.notas} />

          {/* Mensaje de error de acción si existiese */}
          {actionError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              {actionError}
            </div>
          )}
        </div>

        {/* Footer Modal con Botones de Acción */}
        <div className="px-6 py-4 border-t border-[#E8E5F4] bg-[#FAF9FD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Botón Redirigir siempre visible para reasignación */}
            <button
              type="button"
              disabled={isSavingThis}
              onClick={() => setShowRedirect((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-[#E8E5F4] bg-white text-[#615274] hover:text-[#6B46FE] hover:bg-violet-50 transition cursor-pointer"
            >
              <ArrowRightLeft size={14} /> Redirigir
            </button>

            {/* Poner en atención */}
            {item.estado === 'RECIBIDA' && (
              <button
                type="button"
                disabled={isSavingThis}
                onClick={() => onUpdateEstado(item.id_incidencia, 'EN ATENCIÓN')}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#FFF4E5] text-[#D97706] hover:bg-amber-200 transition cursor-pointer"
              >
                {isSavingThis ? 'Guardando…' : 'Poner en atención'}
              </button>
            )}

            {/* Marcar como resuelta */}
            {item.estado !== 'RESUELTA' && (
              <button
                type="button"
                disabled={isSavingThis}
                onClick={() => onUpdateEstado(item.id_incidencia, 'RESUELTA')}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6B46FE] text-white hover:bg-[#5833EA] transition cursor-pointer shadow-xs"
              >
                {isSavingThis ? 'Guardando…' : 'Marcar como resuelta'}
              </button>
            )}

            {/* Revocar estado (para resueltas con límite de 2 días) */}
            {item.estado === 'RESUELTA' && (
              <>
                {puedeRevocar ? (
                  <button
                    type="button"
                    disabled={isSavingThis}
                    onClick={() => onRevocar(item.id_incidencia)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    {isSavingThis ? 'Revocando…' : 'Revocar estado'}
                  </button>
                ) : (
                  <span
                    title={`Resuelta hace ${diasTranscurridos} días. El límite máximo para revocar es de 2 días.`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed select-none"
                  >
                    <RotateCcw size={13} /> Revocación expirada (&gt;2 días)
                  </span>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-[#E8E5F4] text-[#1C1135] hover:bg-[#DDD8EE] transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
