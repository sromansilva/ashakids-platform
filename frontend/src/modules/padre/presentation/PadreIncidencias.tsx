import { useEffect, useState } from 'react';
import { View } from '@/shared/domain/types/navigation';
import { IncidentForm } from '@/shared/presentation/components/common/IncidentForm';
import { IncidentsTable } from '@/shared/presentation/components/common/IncidentsTable';
import { incidenciasService, Incidencia } from '@/modules/comunicacion/infrastructure/incidenciasService';
import { Send, History, ShieldAlert } from 'lucide-react';

export function PadreIncidencias({ go: _go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<'ENVIAR' | 'HISTORIAL'>('ENVIAR');
  const [items, setItems] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistorial = () => {
    setLoading(true);
    incidenciasService
      .misIncidencias()
      .then((res) => {
        setItems(res.items || []);
      })
      .catch((err) => {
        console.warn('[PadreIncidencias] Error al cargar mis incidencias:', err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'HISTORIAL') {
      loadHistorial();
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-4 sm:p-8" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera del Centro Familiar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E5F4] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6B46FE] text-xs font-black mb-2">
              <ShieldAlert size={14} /> Centro de Soporte Familiar
            </div>
            <h1 className="text-3xl font-black text-[#1C1135] tracking-tight">Incidencias y Solicitudes</h1>
            <p className="text-sm font-medium text-[#6B5E8A] mt-1">
              Envía solicitudes directamente al equipo o consulta el estado de tus solicitudes previas.
            </p>
          </div>

          {/* Pastillas de Navegación de Pestañas */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E8E5F4] shadow-2xs">
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
              <History size={14} /> Mis incidencias {items.length > 0 ? `(${items.length})` : ''}
            </button>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {tab === 'ENVIAR' ? (
          <div>
            <IncidentForm
              role="PADRE"
              title="¿Tienes alguna consulta o inconveniente?"
              subtitle="El sistema asignará automáticamente tu solicitud a Administración, Terapeuta o Soporte Técnico según el tipo de solicitud."
              onSuccess={() => {
                // Actualizar historial y ofrecer ir al historial
                loadHistorial();
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E5F4] p-5 shadow-2xs">
              <h2 className="text-base font-black text-[#1C1135]">Historial de solicitudes enviadas</h2>
              <p className="text-xs text-[#6B5E8A] font-medium mt-0.5">
                Consulta exclusivamente las solicitudes registradas con tu cuenta familiar y su estado de resolución en tiempo real.
              </p>
            </div>

            <IncidentsTable
              items={items}
              loading={loading}
              onRefresh={loadHistorial}
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
