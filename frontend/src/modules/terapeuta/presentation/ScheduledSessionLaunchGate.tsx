import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/application/useAuth';
import { appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { isMeetingUrl } from '@/shared/presentation/components/common/VirtualMeeting';

type Destination = 'panel' | 'meet';

const SESSION_WAIT_ATTEMPTS = 8;
const SESSION_WAIT_INTERVAL_MS = 1000;

export function ScheduledSessionLaunchGate() {
  const { appointmentId: rawId, destination: rawDestination } = useParams();
  const appointmentId = Number(rawId);
  const validId = Number.isInteger(appointmentId) && appointmentId > 0;
  const destination = rawDestination === 'panel' || rawDestination === 'meet' ? rawDestination as Destination : null;
  const { role } = useAuth();
  const navigate = useNavigate();
  const appointment = useRemote(
    ['scheduled-session-launch', appointmentId, destination],
    (signal) => appointmentsService.get(appointmentId, signal),
    validId && destination !== null,
  );
  const [now, setNow] = useState(Date.now);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const launchStarted = useRef(false);
  const mounted = useRef(true);
  const startMs = Date.parse(appointment.data?.fecha_hora_inicio ?? '');
  // El terapeuta puede iniciar unos minutos antes: en ese caso no hay que esperar a la hora exacta.
  const alreadyRunning = appointment.data?.estado_sesion === 'EN_CURSO';
  const ready = Number.isFinite(startMs) && (now >= startMs || alreadyRunning);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Mientras se espera, consulta el estado cada pocos segundos para detectar que la sesión ya inició.
  useEffect(() => {
    if (!validId || !destination || ready || launchStarted.current) return;
    const timer = window.setInterval(() => void appointment.refetch(), 5000);
    return () => window.clearInterval(timer);
  }, [appointment.refetch, destination, ready, validId]);

  useEffect(() => {
    if (!validId || !destination || !appointment.data || !ready || launchStarted.current) return;
    launchStarted.current = true;
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    void (async () => {
      // La sesión puede estar todavía creándose desde la otra pestaña: reintenta unos segundos.
      let current = await appointmentsService.get(appointmentId);
      for (let attempt = 0; destination === 'panel' && !current.id_sesion && attempt < SESSION_WAIT_ATTEMPTS && mounted.current; attempt += 1) {
        await wait(SESSION_WAIT_INTERVAL_MS);
        current = await appointmentsService.get(appointmentId);
      }
      if (!mounted.current) return;
      const running = current.estado_sesion === 'EN_CURSO';
      if (current.estado_reserva !== 'CONFIRMADA' || (!running && Date.parse(current.fecha_hora_inicio) > Date.now())) {
        throw new Error('appointment-not-ready');
      }
      if (destination === 'meet') {
        if (!isMeetingUrl(current.meet_url)) throw new Error('meeting-link-unavailable');
        window.location.replace(current.meet_url!);
        return;
      }
      if (!Number.isInteger(current.id_sesion) || !current.id_sesion) throw new Error('session-not-ready');
      const path = role === 'ADMIN' ? `/admin/sesion/${appointmentId}` : `/terapeuta/sesion/${appointmentId}`;
      navigate(path, { replace: true });
    })().catch(() => {
      if (mounted.current) setLaunchError('La cita cambió o no está lista para iniciar. Vuelve a la agenda para revisar su estado.');
    });
  }, [appointment.data, appointmentId, destination, navigate, ready, role, validId]);

  const timeLabel = Number.isFinite(startMs)
    ? new Date(startMs).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : null;
  const remainingSeconds = Number.isFinite(startMs) ? Math.max(0, Math.ceil((startMs - now) / 1000)) : 0;
  const title = destination === 'meet' ? 'Google Meet' : 'Panel clínico';
  const agendaPath = role === 'ADMIN' ? '/admin/citas' : '/terapeuta/agenda';

  if (!validId || !destination) {
    return <LaunchMessage title="No se pudo preparar la sesión" message="La cita o el destino de inicio no son válidos." agendaPath={agendaPath} />;
  }
  if (appointment.isPending) {
    return <LaunchMessage title="Preparando la sesión" message="Estamos comprobando la cita y su hora de inicio." agendaPath={agendaPath} />;
  }
  if (appointment.error || !appointment.data || !Number.isFinite(startMs)) {
    return <LaunchMessage title="No se pudo preparar la sesión" message="No pudimos comprobar la cita. Vuelve a la agenda e inténtalo de nuevo." agendaPath={agendaPath} />;
  }
  if (launchError) {
    return <LaunchMessage title="La cita necesita revisión" message={launchError} agendaPath={agendaPath} />;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7FC] p-5 text-[#1C1135]" aria-live="polite">
      <section className="w-full max-w-lg rounded-3xl border border-[#E8E5F4] bg-white p-7 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Ashakids · inicio programado</p>
        <h1 className="mt-3 text-2xl font-black">{title} se abrirá a la hora de la cita</h1>
        <p className="mt-3 text-sm text-[#615274]">
          La pestaña está lista. {timeLabel ? `La sesión está programada para las ${timeLabel}.` : 'Esperamos la hora programada.'}
        </p>
        {remainingSeconds > 0 && (
          <p className="mt-6 rounded-2xl bg-violet-50 px-4 py-3 text-lg font-black tabular-nums" role="status">
            {minutes}:{String(seconds).padStart(2, '0')} para el inicio
          </p>
        )}
        {remainingSeconds === 0 && <p className="mt-6 text-sm font-bold text-violet-800" role="status">Comprobando que la cita siga confirmada…</p>}
        <a className="mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50" href={agendaPath}>Volver a la agenda</a>
      </section>
    </main>
  );
}

function LaunchMessage({ title, message, agendaPath }: { title: string; message: string; agendaPath: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7FC] p-5 text-[#1C1135]" role="alert">
      <section className="w-full max-w-lg rounded-3xl border border-[#E8E5F4] bg-white p-7 text-center shadow-sm">
        <h1 className="text-xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-[#615274]">{message}</p>
        <a className="mt-5 inline-flex rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white" href={agendaPath}>Abrir agenda</a>
      </section>
    </main>
  );
}
