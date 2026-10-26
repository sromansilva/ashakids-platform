import { useId, useState, useRef, useEffect } from 'react';
import { Bell, Check, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useWrite } from '@/shared/application/hooks/useRemoteData';
import { notificationsService } from '@/modules/comunicacion/infrastructure/notificationsService';
import type { View } from '@/shared/domain/types/navigation';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

const date = (value: string) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

export function NotificationCenter({ go }: { go: (view: View) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [unread, setUnread] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const query = useQuery({
    queryKey: [user?.id_usuario, 'notifications', offset, unread],
    queryFn: ({ signal }) => notificationsService.inbox(offset, unread, signal),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const read = useWrite((id: number) => notificationsService.read(id));
  const all = useWrite(() => notificationsService.readAll());
  const count = query.data?.sin_leer ?? 0;
  const items = query.error ? [] : query.data?.items ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E8E5F4] bg-[#F8F7FC] hover:bg-violet-50 text-xs font-bold text-[#6B46FE] transition-all shadow-sm active:scale-95"
      >
        <Bell size={15} />
        <span>Notificaciones</span>
        {query.error ? (
          <span className="text-red-700 font-bold">Sin conexión</span>
        ) : query.isPending ? (
          <span>Cargando…</span>
        ) : (
          <span className="tabular-nums font-black">{count} sin leer</span>
        )}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[90vw] bg-white border border-[#E8E5F4] rounded-2xl shadow-xl z-50 p-4 sm:p-5 text-[#1C1135]"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="flex justify-between gap-3 flex-wrap items-center pb-3 border-b border-[#E8E5F4]">
            <h2 className="text-base font-extrabold text-[#1C1135]">Notificaciones</h2>
            <Btn variant="outline" size="sm" onClick={() => { setOpen(false); go('terapeuta/config'); }}>
              Configurar avisos
            </Btn>
          </div>

          <div className="mt-3 flex gap-2 justify-between items-center text-xs">
            <label className="flex items-center gap-1.5 font-bold text-[#615274] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[#6B46FE] rounded"
                checked={unread}
                onChange={(e) => {
                  setUnread(e.target.checked);
                  setOffset(0);
                }}
              />
              Solo sin leer
            </label>
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
                Actualizar
              </Btn>
              <Btn
                size="sm"
                variant="outline"
                disabled={!count || all.isPending || !!query.error}
                onClick={() => void all.submit(undefined)}
              >
                Leídas
              </Btn>
            </div>
          </div>

          <RemoteFeedback
            pending={query.isPending}
            error={query.error || read.error || all.error}
            retry={() => void query.refetch()}
          />

          {query.isSuccess && !query.error && (
            items.length ? (
              <ul className="mt-3 divide-y divide-[#E8E5F4] max-h-[48vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.id_notificacion} className="py-3 space-y-1.5">
                    <div className="flex gap-2 items-center justify-between">
                      <h3 className="font-extrabold text-xs text-[#1C1135]">{item.titulo}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.leida_en ? 'text-[#615274] bg-gray-100' : 'text-[#6B46FE] bg-[#EDE9FE]'}`}>
                        {item.leida_en ? 'Leída' : 'Sin leer'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#615274] break-words">{item.texto}</p>
                    <time className="block text-[11px] text-[#9E95B7]" dateTime={item.fecha_creacion}>
                      {date(item.fecha_creacion)}
                    </time>
                    <div className="flex gap-2 pt-1">
                      {item.id_reserva && (
                        <Btn size="sm" variant="outline" onClick={() => { setOpen(false); go('terapeuta/agenda'); }}>
                          Ver agenda
                        </Btn>
                      )}
                      {item.id_conversacion && (
                        <Btn size="sm" variant="outline" onClick={() => { setOpen(false); go('terapeuta/mensajes'); }}>
                          Ver mensajes
                        </Btn>
                      )}
                      {!item.leida_en && (
                        <Btn
                          size="sm"
                          variant="outline"
                          disabled={read.isPending}
                          onClick={() => void read.submit(item.id_notificacion)}
                        >
                          <Check size={12} className="mr-1" />
                          Marcar como leída
                        </Btn>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-xs text-[#615274]">
                {unread ? 'No tienes notificaciones sin leer.' : 'Todavía no tienes notificaciones.'}
              </p>
            )
          )}

          <div className="mt-3 pt-2 border-t border-[#E8E5F4] flex justify-between gap-2">
            <Btn
              size="sm"
              variant="outline"
              disabled={!offset || query.isFetching}
              onClick={() => setOffset((v) => Math.max(0, v - 20))}
            >
              Recientes
            </Btn>
            <Btn
              size="sm"
              variant="outline"
              disabled={offset + 20 >= (query.data?.total ?? 0) || query.isFetching || !!query.error}
              onClick={() => setOffset((v) => v + 20)}
            >
              Anteriores
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
