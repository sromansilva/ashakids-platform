import { useEffect, useState } from 'react';
import { CheckCircle, FileText, Settings, Target } from 'lucide-react';
import {
  incidenciasService,
  tiposIncidencia,
  TerapeutaOption,
  Incidencia,
} from '@/modules/comunicacion/infrastructure/incidenciasService';
import { IncidentTherapistSelector } from './IncidentTherapistSelector';

export function getAutomaticAreaForTipo(tipo: string): 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO' | null {
  if (
    [
      'Seguimiento Terapéutico',
      'Sesiones y Citas',
      'Mundo ASHA',
      'Paciente / Agenda',
    ].includes(tipo)
  ) {
    return 'TERAPEUTA';
  }

  if (
    [
      'Cuentas y Permisos',
      'Seguridad y Acceso',
      'Información de Perfil',
    ].includes(tipo)
  ) {
    return 'ADMINISTRACION';
  }

  if (
    [
      'Funcional',
      'Visual / Diseño',
      'Carga / Rendimiento',
      'Error de datos',
      'Soporte de Plataforma',
    ].includes(tipo)
  ) {
    return 'SOPORTE_TECNICO';
  }

  return null;
}

interface IncidentFormProps {
  role?: 'PADRE' | 'TERAPEUTA' | 'ADMIN' | 'SOPORTE_TECNICO';
  submitIncident?: (body: {
    envio_id: string;
    tipo: string;
    titulo?: string;
    descripcion: string;
    area_destino?: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
    id_terapeuta?: number | null;
  }) => Promise<Incidencia>;
  defaultTipo?: string;
  submitButtonText?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  onSuccess?: (inc: Incidencia) => void;
}

export function IncidentForm({
  role = 'PADRE',
  defaultTipo = '',
  submitButtonText = 'Enviar solicitud',
  title = 'Reportar incidencia',
  subtitle = 'Cuéntanos qué problema encontraste. El área correspondiente atenderá tu solicitud.',
  className = '',
  onSuccess,
  submitIncident = incidenciasService.crear,
}: IncidentFormProps) {
  const [tipo, setTipo] = useState(defaultTipo);
  const [manualArea, setManualArea] = useState<'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO' | ''>('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [envio, setEnvio] = useState(() => crypto.randomUUID());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [sentTicket, setSentTicket] = useState<string>('');
  const [error, setError] = useState('');

  // Terapeutas relacionados
  const [terapeutasPrevios, setTerapeutaPrevios] = useState<TerapeutaOption[]>([]);
  const [terapeutasDisponibles, setTerapeutaDisponibles] = useState<TerapeutaOption[]>([]);
  const [terapeutaMode, setTerapeutaMode] = useState<'PREVIO' | 'OTRO'>('PREVIO');
  const [selectedTerapeutaId, setSelectedTerapeutaId] = useState<number | null>(null);

  const fieldStyle =
    'block w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3.5 text-sm text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-hidden focus:border-[#6B46FE] focus:ring-3 focus:ring-[#6B46FE]/15 disabled:opacity-60 transition-all';

  useEffect(() => {
    if (typeof incidenciasService.terapeutasRelacionados === 'function') {
      incidenciasService
        .terapeutasRelacionados()
        .then((data) => {
          setTerapeutaPrevios(data.previos || []);
          setTerapeutaDisponibles(data.disponibles || []);
          if (data.previos && data.previos.length > 0) {
            setSelectedTerapeutaId(data.previos[0].id_terapeuta);
          } else if (data.disponibles && data.disponibles.length > 0) {
            setSelectedTerapeutaId(data.disponibles[0].id_terapeuta);
          }
        })
        .catch(() => {
          // Fallback silencioso si no hay conexión o en pruebas
        });
    }
  }, [role]);

  const changed = () => {
    setEnvio(crypto.randomUUID());
    setError('');
  };

  // Determinar área de destino: automática para tipos estándar, manual para 'Otro'
  const resolvedArea: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO' | null =
    tipo === 'Otro' ? (manualArea || null) : (tipo ? getAutomaticAreaForTipo(tipo) : null);

  const isTherapistDestination = resolvedArea === 'TERAPEUTA';

  const isValid =
    !!tipo &&
    !!resolvedArea &&
    !!titulo.trim() &&
    !!descripcion.trim() &&
    (!isTherapistDestination || selectedTerapeutaId !== null || terapeutasDisponibles.length === 0);

  return (
    <section className={`${className ? 'w-full max-w-[1320px]' : 'w-full max-w-5xl'} mx-auto p-4 sm:p-8 ${className}`} style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">{title}</h1>
        <p className="text-sm font-medium text-[#6B5E8A] mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6 sm:p-8 shadow-xs">
          {sent !== null ? (
            <div role="status" className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900">
              <CheckCircle size={28} className="text-emerald-600 mb-2" aria-hidden="true" />
              <h2 className="font-black text-xl">
                {sentTicket ? `Ticket ${sentTicket} registrado` : `Reporte #${sent} enviado`}
              </h2>
              <p className="text-sm mt-1 text-emerald-800">
                Tu solicitud ha sido registrada exitosamente y asignada al área correspondiente. Puedes seguir su estado en
                tu historial.
              </p>
              <button
                type="button"
                className="mt-5 font-bold text-sm text-[#6B46FE] underline hover:text-[#5835E5]"
                onClick={() => {
                  setSent(null);
                  setSentTicket('');
                  setTipo(defaultTipo);
                  setManualArea('');
                  setTitulo('');
                  setDescripcion('');
                  changed();
                }}
              >
                Enviar otro reporte
              </button>
            </div>
          ) : (
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                if (sending || !isValid) return;
                setSending(true);
                setError('');
                try {
                  const result = await submitIncident({
                    envio_id: envio,
                    tipo,
                    titulo: titulo.trim(),
                    descripcion: descripcion.trim(),
                    area_destino: resolvedArea || undefined,
                    id_terapeuta: isTherapistDestination ? selectedTerapeutaId : null,
                  });
                  setSent(result.id_incidencia);
                  if (result.ticket) setSentTicket(result.ticket);
                  if (onSuccess) onSuccess(result);
                } catch (cause) {
                  setError(
                    cause instanceof Error ? cause.message : 'No se pudo enviar el reporte. Intenta nuevamente.'
                  );
                } finally {
                  setSending(false);
                }
              }}
            >
              <div>
                <label htmlFor="incident-type" className="block text-xs font-bold text-[#1C1135] mb-2">
                  Tipo de incidencia
                </label>
                <select
                  id="incident-type"
                  required
                  disabled={sending}
                  value={tipo}
                  className={fieldStyle}
                  onChange={(e) => {
                    const newTipo = e.target.value;
                    setTipo(newTipo);
                    if (newTipo !== 'Otro') {
                      setManualArea('');
                    }
                    const autoArea = getAutomaticAreaForTipo(newTipo);
                    if (autoArea === 'TERAPEUTA' && !selectedTerapeutaId) {
                      if (terapeutasPrevios.length > 0) {
                        setSelectedTerapeutaId(terapeutasPrevios[0].id_terapeuta);
                      } else if (terapeutasDisponibles.length > 0) {
                        setSelectedTerapeutaId(terapeutasDisponibles[0].id_terapeuta);
                      }
                    }
                    changed();
                  }}
                >
                  <option value="" disabled>
                    Selecciona el tipo de problema
                  </option>
                  {tiposIncidencia.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cuadro de Área de destino y asignación (no editable para tipos definidos, editable para 'Otro') */}
              {!!tipo && (
                <div className="bg-[#FAF9FD] border border-[#E8E5F4] p-4 rounded-2xl space-y-3">
                  {tipo !== 'Otro' ? (
                    <div>
                      <label htmlFor="incident-destination-area" className="block text-xs font-bold text-[#1C1135] mb-2">
                        Área de destino
                      </label>
                      <input
                        id="incident-destination-area"
                        type="text"
                        readOnly
                        disabled
                        value={
                          resolvedArea === 'SOPORTE_TECNICO'
                            ? 'Soporte Técnico'
                            : resolvedArea === 'ADMINISTRACION'
                            ? 'Administración'
                            : resolvedArea === 'TERAPEUTA'
                            ? 'Terapeuta'
                            : ''
                        }
                        className={`${fieldStyle} bg-[#F4F2FA] text-[#1C1135] font-bold cursor-not-allowed border-[#DDD8EE] select-none`}
                      />
                      <p className="text-[11px] text-[#6B5E8A] font-medium mt-1.5">
                        {resolvedArea === 'SOPORTE_TECNICO' && 'Asignación automática: esta incidencia será atendida por Soporte Técnico.'}
                        {resolvedArea === 'ADMINISTRACION' && 'Asignación automática: esta incidencia será atendida por Administración.'}
                        {resolvedArea === 'TERAPEUTA' && 'Asignación automática: esta incidencia está dirigida al área clínica / terapeuta.'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="incident-destination-area" className="block text-xs font-bold text-[#1C1135] mb-2">
                        Área de destino
                      </label>
                      <select
                        id="incident-destination-area"
                        required
                        disabled={sending}
                        value={manualArea}
                        className={fieldStyle}
                        onChange={(e) => {
                          const val = e.target.value as 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
                          setManualArea(val);
                          if (val === 'TERAPEUTA' && !selectedTerapeutaId) {
                            if (terapeutasPrevios.length > 0) {
                              setSelectedTerapeutaId(terapeutasPrevios[0].id_terapeuta);
                            } else if (terapeutasDisponibles.length > 0) {
                              setSelectedTerapeutaId(terapeutasDisponibles[0].id_terapeuta);
                            }
                          }
                          changed();
                        }}
                      >
                        <option value="" disabled>
                          Selecciona el área de destino
                        </option>
                        <option value="SOPORTE_TECNICO">Soporte Técnico</option>
                        <option value="ADMINISTRACION">Administración</option>
                        <option value="TERAPEUTA">Terapeuta</option>
                      </select>
                      <p className="text-[11px] text-[#6B5E8A] font-medium mt-1.5">
                        Para incidencias tipo &quot;Otro&quot;, puedes elegir libremente a qué área remitir tu reporte.
                      </p>
                    </div>
                  )}

                  {isTherapistDestination && (
                    <IncidentTherapistSelector
                      terapeutasPrevios={terapeutasPrevios}
                      terapeutasDisponibles={terapeutasDisponibles}
                      terapeutaMode={terapeutaMode}
                      setTerapeutaMode={setTerapeutaMode}
                      selectedTerapeutaId={selectedTerapeutaId}
                      onSelectTerapeuta={(id) => {
                        setSelectedTerapeutaId(id);
                        changed();
                      }}
                      fieldStyle={fieldStyle}
                    />
                  )}
                </div>
              )}

              <div>
                <label htmlFor="incident-title" className="block text-xs font-bold text-[#1C1135] mb-2">
                  Título
                </label>
                <input
                  id="incident-title"
                  required
                  maxLength={120}
                  disabled={sending}
                  value={titulo}
                  className={fieldStyle}
                  placeholder="Ej.: El botón de guardar no responde"
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    changed();
                  }}
                />
              </div>

              <div>
                <label htmlFor="incident-description" className="block text-xs font-bold text-[#1C1135] mb-2">
                  Descripción breve
                </label>
                <textarea
                  id="incident-description"
                  required
                  maxLength={600}
                  rows={5}
                  disabled={sending}
                  value={descripcion}
                  className={`${fieldStyle} resize-y`}
                  aria-describedby="incident-help"
                  placeholder="Indica la sección, qué ocurrió y qué esperabas."
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    changed();
                  }}
                />
                <div className="flex items-center justify-between text-xs text-[#8C82A8] mt-2 font-medium">
                  <span id="incident-help">Hasta 600 caracteres. Evita incluir contraseñas o información clínica.</span>
                  <span>{descripcion.length}/600</span>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 p-4 rounded-2xl">
                  {error} Tu borrador se conserva.
                </p>
              )}

              <button
                type="submit"
                disabled={sending || !isValid}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-[.98] disabled:bg-[#C8C2DC] disabled:shadow-none bg-[#6B46FE] hover:bg-[#5835E5] shadow-[#6B46FE]/20"
              >
                {sending ? 'Enviando…' : submitButtonText}
              </button>
            </form>
          )}
        </div>

        {/* Guía informativa lateral */}
        <div className="bg-gradient-to-b from-[#FFF7EE] to-white rounded-3xl border border-[#FFE8D1] p-6 sm:p-7 shadow-xs">
          <div className="flex justify-center mb-2">
            <img
              src="/illustrations/optimized/step-account-v54-640-9a7c8a92d7.webp"
              alt="Ayuda"
              className="w-40 h-auto object-contain drop-shadow-sm select-none"
            />
          </div>

          <h2 className="text-xl font-black text-[#1C1135] text-center mb-1">¡Nos ayudas a mejorar!</h2>
          <p className="text-xs text-[#6B5E8A] text-center font-medium mb-6">
            Cuéntanos un poco más para que podamos revisar tu reporte.
          </p>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#F0EEF8] p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-[#6B46FE] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-extrabold text-xs text-[#1C1135] flex items-center gap-1.5">
                  <FileText size={14} className="text-[#6B46FE]" /> Indica la sección
                </p>
                <p className="text-[11px] text-[#6B5E8A] font-medium mt-0.5 leading-snug">
                  Menciona en qué parte de la plataforma ocurrió el problema.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F0EEF8] p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0D9488] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-extrabold text-xs text-[#1C1135] flex items-center gap-1.5">
                  <Target size={14} className="text-[#0D9488]" /> ¿Qué esperabas?
                </p>
                <p className="text-[11px] text-[#6B5E8A] font-medium mt-0.5 leading-snug">
                  Ayúdanos a entender el comportamiento que consideras correcto.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#F0EEF8] p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-extrabold text-xs text-[#1C1135] flex items-center gap-1.5">
                  <Settings size={14} className="text-[#D97706]" /> Asignación automática
                </p>
                <p className="text-[11px] text-[#6B5E8A] font-medium mt-0.5 leading-snug">
                  Tu reporte llegará directamente a Administración, Terapeuta o Soporte Técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
