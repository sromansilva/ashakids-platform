import { useQuery } from '@tanstack/react-query';
import { Mic, Video } from 'lucide-react';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Appointment } from '@/modules/clinica/domain/clinical';
import { isMeetingUrl } from './VirtualMeeting';

type NoticeAppointment = Pick<Appointment, 'id_reserva' | 'id_sesion' | 'estado_sesion' | 'meet_url' | 'paciente_nombre' | 'terapeuta_nombre'>;

const actionClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition';

/**
 * Aviso destacado para la familia: sesión en curso y/o muestra de voz pendiente. Se muestra solo
 * mientras el terapeuta mantiene la sesión en curso, sin que la familia tenga que buscarlo.
 */
export function FamilySessionNotice({ appointment, onOpen }: {
  appointment: NoticeAppointment;
  /** En el Centro familiar lleva a la cita; dentro de la cita se omite. */
  onOpen?: () => void;
}) {
  const live = appointment.estado_sesion === 'EN_CURSO' && !!appointment.id_sesion;
  const sessionId = appointment.id_sesion;
  const pending = useQuery({
    queryKey: ['family-phonetic-capture', sessionId],
    queryFn: ({ signal }) => sessionsService.capturaFamiliarPendiente(sessionId!, signal),
    enabled: live,
    refetchInterval: 3000,
  });
  if (!live) return null;
  const request = pending.data;
  const sampleRequested = request?.estado === 'SOLICITADA' || request?.estado === 'EN_CAPTURA';
  const meet = isMeetingUrl(appointment.meet_url) ? appointment.meet_url : null;
  const goToRecorder = () => {
    const node = document.getElementById(`family-capture-${sessionId}`);
    node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    node?.focus?.({ preventScroll: true });
  };

  return (
    <div role="status" aria-live="polite" data-testid="family-session-notice"
      className="rounded-3xl border border-[#6B46FE]/30 bg-[#F8F7FC] p-4 shadow-sm sm:p-5">
      <p className="text-xs font-black uppercase tracking-wide text-[#6B46FE]">
        {sampleRequested ? 'Tu terapeuta te pidió una muestra' : 'Sesión en curso'}
      </p>
      <h2 className="mt-1 text-lg font-black text-[#1C1135]">
        {sampleRequested
          ? `Graba la palabra «${request && 'palabra_objetivo' in request ? request.palabra_objetivo : ''}»`
          : `${appointment.terapeuta_nombre} inició la sesión de ${appointment.paciente_nombre}`}
      </h2>
      <p className="mt-1 text-sm text-[#615274]">
        {sampleRequested
          ? 'Son 2 a 3 segundos desde el micrófono de este dispositivo. El audio no se guarda y tu terapeuta revisa el resultado.'
          : 'Ya puedes entrar a la reunión desde AshaKids.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {meet && (
          <a className={`${actionClass} bg-[#6B46FE] text-white shadow-sm hover:bg-[#5833EA]`} href={meet} target="_blank" rel="noopener noreferrer">
            <Video size={16} /> Entrar a la reunión
          </a>
        )}
        {sampleRequested && (
          <button type="button" className={`${actionClass} border border-[#6B46FE] bg-white text-[#6B46FE] hover:bg-[#EDE9FE]`}
            onClick={onOpen ?? goToRecorder}>
            <Mic size={16} /> Grabar ahora
          </button>
        )}
        {!sampleRequested && onOpen && (
          <button type="button" className={`${actionClass} border border-[#E8E5F4] bg-white text-[#594A6F] hover:bg-[#EDE9FE]`} onClick={onOpen}>
            Ver la cita
          </button>
        )}
      </div>
    </div>
  );
}
