import { useEffect, useState } from 'react';
import { CheckCircle, FileText, Settings, Target } from 'lucide-react';
import {
  incidenciasService,
  tiposIncidencia,
  Incidencia,
} from '@/modules/comunicacion/infrastructure/incidenciasService';

export function getAutomaticAreaForTipo(
  tipo: string,
  role: 'PADRE' | 'TERAPEUTA' | 'ADMIN' | 'SOPORTE_TECNICO' = 'PADRE',
  hasRelatedTherapist = false,
): 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO' | null {
  if (tipo === 'Problemas técnicos') return 'SOPORTE_TECNICO';
  if (tipo === 'Problemas de permisos') return role === 'ADMIN' || role === 'SOPORTE_TECNICO' ? 'SOPORTE_TECNICO' : 'ADMINISTRACION';
  if (tipo === 'Problemas de información') {
    if (role === 'PADRE') return hasRelatedTherapist ? 'TERAPEUTA' : 'ADMINISTRACION';
    return role === 'TERAPEUTA' ? 'ADMINISTRACION' : 'SOPORTE_TECNICO';
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
  const categoryOptions = role === 'SOPORTE_TECNICO' ? [tiposIncidencia[0]] : tiposIncidencia;
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [envio, setEnvio] = useState(() => crypto.randomUUID());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<number | null>(null);
  const [sentTicket, setSentTicket] = useState<string>('');
  const [error, setError] = useState('');

  const [hasRelatedTherapist, setHasRelatedTherapist] = useState(false);
  const [therapistLookupDone, setTherapistLookupDone] = useState(role !== 'PADRE');

  const fieldStyle =
    'block w-full rounded-2xl border border-[#E8E5F4] bg-white px-4 py-3.5 text-sm text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-hidden focus:border-[#6B46FE] focus:ring-3 focus:ring-[#6B46FE]/15 disabled:opacity-60 transition-all';

  useEffect(() => {
    if (role !== 'PADRE') {
      setTherapistLookupDone(true);
      return;
    }
    setTherapistLookupDone(false);
    if (typeof incidenciasService.terapeutasRelacionados !== 'function') {
      setHasRelatedTherapist(false);
      setTherapistLookupDone(true);
      return;
    }
    let active = true;
    incidenciasService
      .terapeutasRelacionados()
      .then((data) => {
        if (active) setHasRelatedTherapist((data.previos || []).length > 0);
      })
      .catch(() => {
        if (active) setHasRelatedTherapist(false);
      })
      .finally(() => {
        if (active) setTherapistLookupDone(true);
      });
    return () => { active = false; };
  }, [role]);

  const changed = () => {
    setEnvio(crypto.randomUUID());
    setError('');
  };

  const resolvedArea = tipo ? getAutomaticAreaForTipo(tipo, role, hasRelatedTherapist) : null;
  const waitingForTherapist = role === 'PADRE' && tipo === 'Problemas de información' && !therapistLookupDone;

  const isValid =
    !!tipo &&
    !!resolvedArea &&
    !!titulo.trim() &&
    !!descripcion.trim() &&
    !waitingForTherapist;

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
                    setTipo(e.target.value);
                    changed();
                  }}
                >
                  <option value="" disabled>
                    Selecciona el tipo de problema
                  </option>
                  {categoryOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar el destinatario antes de enviar; el backend decide y valida la asignación. */}
              {!!tipo && (
                <div className="bg-[#FAF9FD] border border-[#E8E5F4] p-4 rounded-2xl space-y-3">
                  <label htmlFor="incident-destination-area" className="block text-xs font-bold text-[#1C1135] mb-2">
                    Área de destino
                  </label>
                  <input
                    id="incident-destination-area"
                    type="text"
                    readOnly
                    disabled
                    value={waitingForTherapist ? 'Consultando destino…' : resolvedArea === 'SOPORTE_TECNICO' ? 'Soporte Técnico' : resolvedArea === 'ADMINISTRACION' ? 'Administración' : 'Terapeuta relacionado'}
                    className={`${fieldStyle} bg-[#F4F2FA] text-[#1C1135] font-bold cursor-not-allowed border-[#DDD8EE] select-none`}
                  />
                  <p className="text-[11px] text-[#6B5E8A] font-medium mt-1.5">
                    {waitingForTherapist && 'Estamos identificando al terapeuta que atenderá la consulta.'}
                    {!waitingForTherapist && resolvedArea === 'SOPORTE_TECNICO' && 'Asignación automática: recibirá el reporte Soporte Técnico.'}
                    {!waitingForTherapist && resolvedArea === 'ADMINISTRACION' && 'Asignación automática: recibirá el reporte Administración.'}
                    {!waitingForTherapist && resolvedArea === 'TERAPEUTA' && 'Asignación automática: recibirá el reporte el terapeuta relacionado con tu familia.'}
                  </p>
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
