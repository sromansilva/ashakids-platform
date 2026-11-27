import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, FileText, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { sessionsService, appointmentsService } from '@/modules/clinica/infrastructure/clinicalService';
import { readAllPages } from '@/core/api/readAllPages';
import { SessionActions } from '@/shared/presentation/components/common/SessionActions';
import { isMeetingUrl } from '@/shared/presentation/components/common/VirtualMeeting';
import type { View } from '@/shared/domain/types/navigation';
import type { Appointment, Session } from '@/modules/clinica/domain/clinical';

function formatLimaTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
}

interface TerapeutaEspacioProfesionalPageProps {
  go?: (v: View) => void;
}

export function TerapeutaEspacioProfesionalPage({ go }: TerapeutaEspacioProfesionalPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const sessionsQuery = useQuery({
    queryKey: [user?.id_usuario, 'sessions'],
    queryFn: ({ signal }) => readAllPages((offset) => sessionsService.list({ limit: 50, offset }, signal), signal),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const appointmentsQuery = useQuery({
    queryKey: [user?.id_usuario, 'appointments'],
    queryFn: ({ signal }) => readAllPages((offset) => appointmentsService.list({ limit: 50, offset }, signal), signal),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const goTo = (view: View, path: string) => {
    if (go) {
      go(view);
    } else {
      navigate(path);
    }
  };

  // Buscar si hay una sesión activa en curso
  const sessions: Session[] = sessionsQuery.data ?? [];
  const appointments: Appointment[] = appointmentsQuery.data ?? [];

  const activeSession = sessions.find((s) => s.estado_sesion === 'EN_CURSO');
  const activeAppointment = appointments.find((a) => a.estado_sesion === 'EN_CURSO');

  const activeAppointmentId = activeSession
    ? (activeSession.cita?.id_reserva ?? activeSession.id_reserva)
    : activeAppointment?.id_reserva;

  // Filtrar citas de hoy para el terapeuta
  const todayLima = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = apt.fecha_hora_inicio.slice(0, 10);
    return aptDate === todayLima && apt.estado_reserva !== 'CANCELADA';
  });

  // Si hay una sesión activa en desarrollo, mostrar el espacio de trabajo activo
  if (activeAppointmentId) {
    const currentAppointment = activeSession?.cita ?? activeAppointment;
    const patientName = currentAppointment?.paciente_nombre ?? 'el paciente';
    const meetUrl = currentAppointment?.meet_url;
    const isVirtual = currentAppointment?.modalidad === 'VIRTUAL';

    return (
      <main className="mx-auto max-w-5xl space-y-5 p-4 text-[#1C1135] sm:p-8">
        <header className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Sesión en curso
              </span>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Espacio profesional</p>
            </div>
            <h1 className="mt-2 text-2xl font-black">Panel clínico de sesión activa</h1>
            <p className="mt-1 text-sm text-[#615274]">
              Reunión con <strong className="text-[#1C1135]">{patientName}</strong>. Aquí tienes el control de la reunión, captura fonológica y reporte clínico.
            </p>
          </div>
          {isVirtual && isMeetingUrl(meetUrl) && (
            <a
              href={meetUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A73E8] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1557B0]"
            >
              <Video size={16} /> Abrir Google Meet
            </a>
          )}
        </header>

        <SessionActions appointmentId={activeAppointmentId} activeSessionPanel />
      </main>
    );
  }

  // En caso de no haber sesión activa (o estar finalizada), mostrar anuncio
  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8 space-y-6">
      <div className="rounded-3xl border border-violet-100 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <img
              src="/illustrations/calendar-in-progress.png"
              alt="Sin reunión activa"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-sm mx-auto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3.5 py-1.5 text-xs font-black tracking-wide text-violet-700">
            <Video size={14} /> Espacio profesional · En espera
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1135]">
            No tienes una reunión activa en este momento
          </h1>
          <p className="text-sm text-[#615274] max-w-xl mx-auto leading-relaxed">
            El <strong>Espacio Profesional</strong> se activa de forma automática cuando inicias una sesión clínica programada con un paciente. Cuando la reunión esté en curso, aquí verás la videollamada, el evaluador de fonemas con apoyo de IA y la redacción del reporte en paralelo.
          </p>
        </div>

        {/* Pasos explicativos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-violet-200/70 bg-violet-50/55 p-4">
            <p className="text-[11px] font-black uppercase text-[#6B46FE]">Paso 1</p>
            <p className="font-extrabold text-xs text-[#1C1135] mt-1">Revisa tu agenda</p>
            <p className="text-[11px] text-[#615274] mt-0.5">Consulta tus citas confirmadas para el día de hoy.</p>
          </div>
          <div className="rounded-2xl border border-orange-200/70 bg-orange-50/55 p-4">
            <p className="text-[11px] font-black uppercase text-orange-600">Paso 2</p>
            <p className="font-extrabold text-xs text-[#1C1135] mt-1">Inicia la reunión</p>
            <p className="text-[11px] text-[#615274] mt-0.5">Presiona &quot;Iniciar reunión&quot; en la agenda o notificación.</p>
          </div>
          <div className="rounded-2xl border border-violet-200/70 bg-violet-50/55 p-4">
            <p className="text-[11px] font-black uppercase text-[#6B46FE]">Paso 3</p>
            <p className="font-extrabold text-xs text-[#1C1135] mt-1">Trabaja en paralelo</p>
            <p className="text-[11px] text-[#615274] mt-0.5">El panel clínico cargará de inmediato en esta vista.</p>
          </div>
        </div>

        {/* Lista de citas programadas para hoy */}
        {todayAppointments.length > 0 && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 sm:p-5 text-left space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-violet-900 flex items-center gap-1.5">
                <Clock size={14} /> Citas programadas para hoy ({todayAppointments.length})
              </h2>
              <span className="text-[11px] text-violet-700 font-bold">Hora local</span>
            </div>
            <ul className="space-y-2">
              {todayAppointments.map((apt) => {
                const start = formatLimaTime(apt.fecha_hora_inicio);
                const end = formatLimaTime(apt.fecha_hora_fin);
                const isCompleted = apt.estado_reserva === 'COMPLETADA' || apt.estado_sesion === 'FINALIZADA';
                return (
                  <li
                    key={apt.id_reserva}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-3.5 rounded-xl border border-violet-100 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#1C1135]">{apt.paciente_nombre}</span>
                        {isCompleted && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            Finalizada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#615274] mt-0.5">
                        {start && end ? `${start} - ${end}` : 'Horario programado'} · {apt.modalidad === 'VIRTUAL' ? 'Virtual (Meet)' : 'Presencial'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo('terapeuta/agenda', '/terapeuta/agenda')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-violet-700 self-start sm:self-auto"
                    >
                      <Calendar size={13} /> {isCompleted ? 'Ver en agenda' : 'Abrir cita'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => goTo('terapeuta/agenda', '/terapeuta/agenda')}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[.98] cursor-pointer"
          >
            <Calendar size={16} /> Ir a mi Agenda para iniciar reunión <ArrowRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => goTo('terapeuta/reportes', '/terapeuta/reportes')}
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3.5 text-sm font-extrabold text-[#6B46FE] transition-all hover:bg-violet-100 cursor-pointer"
          >
            <FileText size={16} /> Ver historial de reportes
          </button>
        </div>
      </div>
    </main>
  );
}
