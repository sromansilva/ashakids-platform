import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Mic, Video } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { notificationsService } from '@/modules/comunicacion/infrastructure/notificationsService';
import { isMeetingUrl } from '@/shared/presentation/components/common/VirtualMeeting';

const actionClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition';

/**
 * Avisos destacados en la bienvenida: sesión en curso o muestra de voz pedida por el terapeuta.
 * Se alimentan de la bandeja de notificaciones (misma consulta que la campana), así que no
 * consultan citas ni sesiones desde esta pantalla.
 */
export function FamilyLiveSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inbox = useQuery({
    queryKey: [user?.id_usuario, 'notifications', 0, false],
    queryFn: ({ signal }) => notificationsService.inbox(0, false, signal),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const items = (inbox.error ? [] : inbox.data?.items ?? []).filter((item) =>
    item.id_reserva && item.sesion_en_curso && !item.leida_en &&
    (item.tipo === 'SESION_INICIADA' || item.tipo === 'MUESTRA_SOLICITADA'));
  if (!items.length) return null;
  const sample = items.find((item) => item.tipo === 'MUESTRA_SOLICITADA');
  const live = items.find((item) => item.tipo === 'SESION_INICIADA');
  // Al abrir la acción el aviso se marca como leído para que no siga fijo en la bienvenida.
  const open = (reservationId: number, notificationId?: number) => {
    if (notificationId) {
      void notificationsService.read(notificationId)
        .then(() => queryClient.invalidateQueries({ queryKey: [user?.id_usuario, 'notifications'] }))
        .catch(() => undefined);
    }
    navigate(`/padre/agenda?cita=${reservationId}`);
  };
  return (
    <div className="mx-auto mb-4 w-full max-w-5xl space-y-3 px-1" data-testid="family-session-notice">
      {sample && (
        <div role="status" className="rounded-3xl border border-[#6B46FE]/30 bg-[#F8F7FC] p-4 shadow-sm sm:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#6B46FE]">Tu terapeuta te pidió una muestra</p>
          <h2 className="mt-1 text-lg font-black text-[#1C1135]">{sample.titulo}</h2>
          <p className="mt-1 text-sm text-[#615274]">{sample.texto}</p>
          <button type="button" className={`${actionClass} mt-3 bg-[#6B46FE] text-white shadow-sm hover:bg-[#5833EA]`} onClick={() => open(sample.id_reserva!, sample.id_notificacion)}>
            <Mic size={16} /> Grabar ahora
          </button>
        </div>
      )}
      {live && (
        <div role="status" className="rounded-3xl border border-[#6B46FE]/30 bg-[#F8F7FC] p-4 shadow-sm sm:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#6B46FE]">Sesión en curso</p>
          <h2 className="mt-1 text-lg font-black text-[#1C1135]">{live.titulo}</h2>
          <p className="mt-1 text-sm text-[#615274]">{live.texto}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isMeetingUrl(live.meet_url) && (
              <a className={`${actionClass} bg-[#6B46FE] text-white shadow-sm hover:bg-[#5833EA]`} href={live.meet_url!} target="_blank" rel="noopener noreferrer">
                <Video size={16} /> Entrar a la reunión
              </a>
            )}
            <button type="button" className={`${actionClass} border border-[#E8E5F4] bg-white text-[#594A6F] hover:bg-[#EDE9FE]`} onClick={() => open(live.id_reserva!, live.id_notificacion)}>
              Ver la cita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
