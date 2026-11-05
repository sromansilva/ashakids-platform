import { useState } from 'react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useWrite } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { isMeetingUrl } from './VirtualMeeting';
import { Clock, FlaskConical } from 'lucide-react';

/** Minutos antes de la hora programada desde los que se puede iniciar (igual que el servidor). */
export const EARLY_START_MINUTES = 5;

export function limaClock(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
}

/** Devuelve por qué el inicio está apagado, o null si el horario permite iniciar. */
export function startBlockReason(appointment: Pick<Appointment, 'estado_reserva' | 'fecha_hora_inicio' | 'fecha_hora_fin'>, now: number): string | null {
  const startMs = Date.parse(appointment.fecha_hora_inicio);
  const endMs = Date.parse(appointment.fecha_hora_fin);
  if (appointment.estado_reserva !== 'CONFIRMADA') return 'La cita debe estar confirmada para iniciar la reunión.';
  if (Number.isFinite(endMs) && now >= endMs) return 'La cita ya terminó; ya no se puede iniciar la reunión.';
  if (Number.isFinite(startMs) && now < startMs - EARLY_START_MINUTES * 60_000) {
    return `Se habilita a las ${limaClock(startMs - EARLY_START_MINUTES * 60_000)}, ${EARLY_START_MINUTES} minutos antes de la cita.`;
  }
  return null;
}

/**
 * Un solo botón "Iniciar reunión" (crea la sesión si falta) y, solo si el servidor lo permite,
 * un botón de modo prueba que ignora el horario. Las ventanas se abren de forma síncrona en el clic.
 */
export function SessionLaunchControls({ appointment, session, now, panelMode = false, disabled = false }: {
  appointment: Appointment;
  session?: Session;
  now: number;
  /** En el panel clínico ya abierto solo se ofrece el modo prueba, sin abrir ventanas. */
  panelMode?: boolean;
  disabled?: boolean;
}) {
  const { role } = useAuth();
  const [opened, setOpened] = useState<{ meet: boolean; test: boolean } | null>(null);
  const sessionId = session?.id_sesion ?? appointment.id_sesion ?? null;
  const launch = useWrite(async ({ testMode }: { testMode: boolean }) => {
    let id = sessionId;
    if (!id) id = (await sessionsService.create(appointment.id_reserva)).id_sesion;
    await sessionsService.start(id, testMode);
  });
  const sessionState = session?.estado_sesion;
  if (appointment.estado_reserva === 'CANCELADA' || (sessionState && sessionState !== 'PROGRAMADA')) return null;

  const reason = startBlockReason(appointment, now);
  const busy = disabled || launch.isPending;
  const virtualMeet = appointment.modalidad === 'VIRTUAL' && isMeetingUrl(appointment.meet_url);
  const base = role === 'ADMIN' ? '/admin/sesion' : '/terapeuta/sesion';

  const open = (testMode: boolean) => {
    if (!panelMode) {
      // Debe ejecutarse en el mismo turno del clic para que el navegador no bloquee las ventanas.
      if (testMode) {
        window.open(`${base}/${appointment.id_reserva}`, '_blank', 'noopener,noreferrer');
        if (virtualMeet) window.open(appointment.meet_url!, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`${base}/espera/${appointment.id_reserva}/panel`, '_blank', 'noopener,noreferrer');
        if (virtualMeet) window.open(`${base}/espera/${appointment.id_reserva}/meet`, '_blank', 'noopener,noreferrer');
      }
      setOpened({ meet: virtualMeet, test: testMode });
    }
    void launch.submit({ testMode });
  };

  return (
    <div className="w-full space-y-2">
      {!panelMode && (
        <div className="flex flex-wrap items-center gap-2">
          <Btn disabled={busy || reason !== null} onClick={() => open(false)}>
            {launch.isPending ? 'Iniciando…' : appointment.modalidad === 'VIRTUAL' ? 'Iniciar reunión' : 'Iniciar sesión'}
          </Btn>
        </div>
      )}
      {!panelMode && reason && (
        <p role="status" className="flex w-full items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-bold text-amber-800">
          <Clock size={14} className="shrink-0 text-amber-600" />
          <span>{reason}</span>
        </p>
      )}
      {appointment.modo_prueba_disponible && appointment.estado_reserva === 'CONFIRMADA' && (
        <div>
          <button
            type="button"
            disabled={busy}
            onClick={() => open(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FlaskConical size={14} /> Iniciar ahora (modo prueba)
          </button>
          <p className="mt-1 text-[11px] font-medium text-amber-800">Solo para pruebas: ignora el horario.</p>
        </div>
      )}
      {opened && (
        <p role="status" className="text-xs font-medium text-[#615274]">
          {opened.test
            ? `Se abrieron el panel clínico${opened.meet ? ' y Google Meet' : ''} sin esperar el horario (modo prueba).`
            : `Se prepararon el panel clínico${opened.meet ? ' y Google Meet' : ''}; se abrirán en cuanto la reunión inicie.`}
          {' '}Si no aparecen, permite las ventanas emergentes para este sitio.
        </p>
      )}
      <RemoteFeedback error={launch.error} />
    </div>
  );
}
