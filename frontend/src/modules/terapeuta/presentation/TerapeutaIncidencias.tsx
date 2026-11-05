import type { IncidentState } from '@/shared/domain/types/IncidentState';
import { useEffect, useState } from 'react';
import { View } from '@/shared/domain/types/navigation';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { IncidentsTable } from '@/shared/presentation/components/common/IncidentsTable';
import { incidenciasService, Incidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { Inbox, Send, History, Stethoscope } from 'lucide-react';

export function TerapeutaIncidencias({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<'RECIBIDAS' | 'ENVIAR' | 'HISTORIAL'>('RECIBIDAS');
  const [recibidas, setRecibidas] = useState<Incidencia[]>([]);
  const [enviadas, setEnviadas] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecibidas = (signal?: AbortSignal) => {
    setLoading(true);
    incidenciasService
      .recibidasTerapeuta(signal)
      .then((res) => {
        if (!signal?.aborted) {
          setRecibidas(res?.items || []);
        }
      })
      .catch((err) => {
        if (!signal?.aborted) {
          console.warn('[TerapeutaIncidencias] Error cargando recibidas:', err);
          setRecibidas([]);
        }
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false);
        }
      });
  };

  const loadEnviadas = (signal?: AbortSignal) => {
    setLoading(true);
    incidenciasService
      .misIncidencias(signal)
      .then((res) => {
        if (!signal?.aborted) {
          setEnviadas(res?.items || []);
        }
      })
      .catch((err) => {
        if (!signal?.aborted) {
          console.warn('[TerapeutaIncidencias] Error cargando enviadas:', err);
          setEnviadas([]);
        }
      })
      .finally(() => {
        if (!signal?.aborted) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    if (tab === 'RECIBIDAS') {
      loadRecibidas(controller.signal);
    } else if (tab === 'HISTORIAL') {
      loadEnviadas(controller.signal);
    }
    return () => {
      controller.abort();
    };
  }, [tab]);

  const handleStatusChange = async (id: number, newStatus: IncidentState) => {
    await incidenciasService.cambiarEstado(id, newStatus);
    setRecibidas((prev) =>
      prev.map((item) => (item.id_incidencia === id ? { ...item, estado: newStatus } : item))
    );
  };

  return (
    <div className="therapist-page min-h-full w-full px-4 py-4 sm:px-6 sm:py-5 xl:px-8" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="w-full space-y-5">
        {/* Cabecera del Terapeuta */}
        <div className="therapist-animate flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 rounded-3xl border border-[#E8E5F4] bg-gradient-to-r from-white via-white to-[#F8F6FF] p-5 sm:p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6B46FE] text-xs font-black mb-2">
              <Stethoscope size={14} /> Gestión Clínica y Solicitudes
            </div>
            <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Módulo de Incidencias</h1>
            <p className="text-sm font-medium text-[#6B5E8A] mt-1">
              Atiende consultas terapéuticas asignadas por familias o reporta solicitudes al sistema.
            </p>
          </div>

          {/* Pastillas de Navegación de 3 Pestañas */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E8E5F4] shadow-2xs">
            <button
              type="button"
              onClick={() => setTab('RECIBIDAS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'RECIBIDAS'
                  ? 'bg-[#6B46FE] text-white shadow-xs'
                  : 'text-[#615274] hover:bg-[#F0EEF8]'
              }`}
            >
              <Inbox size={14} /> Incidencias recibidas {recibidas.length > 0 ? `(${recibidas.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setTab('ENVIAR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'ENVIAR'
                  ? 'bg-[#6B46FE] text-white shadow-xs'
                  : 'text-[#615274] hover:bg-[#F0EEF8]'
              }`}
            >
              <Send size={14} /> Reportar incidencia
            </button>
            <button
              type="button"
              onClick={() => setTab('HISTORIAL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'HISTORIAL'
                  ? 'bg-[#6B46FE] text-white shadow-xs'
                  : 'text-[#615274] hover:bg-[#F0EEF8]'
              }`}
            >
              <History size={14} /> Mis solicitudes {enviadas.length > 0 ? `(${enviadas.length})` : ''}
            </button>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {tab === 'RECIBIDAS' && (
          <div className="therapist-animate min-w-0">
            <IncidentsTable
              items={recibidas}
              loading={loading}
              onRefresh={loadRecibidas}
              canUpdateStatus={true}
              onStatusChange={handleStatusChange}
              isReceivedView={true}
              emptyMessage="No tienes incidencias asignadas pendientes."
            />
          </div>
        )}

        {tab === 'ENVIAR' && (
          <div className="therapist-animate">
            <IncidentForm
              role="TERAPEUTA"
              title="Reportar problema o solicitud técnica"
              subtitle="Tus reportes de funcionamiento o permisos serán asignados automáticamente a Soporte Técnico o Administración."
              onSuccess={() => {
                loadEnviadas();
              }}
            />
          </div>
        )}

        {tab === 'HISTORIAL' && (
          <div className="therapist-animate min-w-0">
            <IncidentsTable
              items={enviadas}
              loading={loading}
              onRefresh={loadEnviadas}
              canUpdateStatus={false}
              isReceivedView={false}
              emptyMessage="No has enviado ninguna incidencia todavía."
            />
          </div>
        )}
      </div>
    </div>
  );
}
