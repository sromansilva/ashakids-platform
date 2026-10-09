import { useState } from "react";
import { X, Shield, Activity } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { SessionActions } from '@/components/common/SessionActions';

export function AdminSesiones() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const query = useRemote(['admin-clinical-sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const sessions = (query.error ? [] : query.data ?? []).map(s => ({
    id: s.id_sesion, appointmentId: s.id_reserva, therapistAv: s.cita.terapeuta_nombre.split(' ').map(n => n[0]).slice(0, 2).join(''), therapistColor: B.violet,
    started: new Date(s.cita.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' }),
    dur: s.fecha_hora_inicio_real && s.fecha_hora_fin_real ? `${Math.round((Date.parse(s.fecha_hora_fin_real) - Date.parse(s.fecha_hora_inicio_real)) / 60000)} min` : 'Sin duración final',
    quality: 'Sin medición', type: s.cita.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial',
    status: s.estado_sesion === 'EN_CURSO' ? 'activa' : s.estado_sesion === 'FINALIZADA' ? 'finalizada' : 'programada',
    latency: 'No disponible', incidents: null, name: s.cita.paciente_nombre, report: s.reporte_disponible,
  }));
  const sel = sessions.find(s => s.id === selectedSession);
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Operational restriction notice */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
        <Shield size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-700">
          <span className="font-extrabold">Acceso autorizado por el servidor.</span> Sesiones y reportes reales; calidad de conexión e incidencias no están medidas por esta API.
        </p>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Sesiones · ASHA Session</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Sesiones clínicas registradas · America/Lima</p>
      </div>
      <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "En curso", val: query.isSuccess && !query.error ? sessions.filter(s => s.status === 'activa').length : '—', color: "#059669", bg: "#D1FAE5" },
          { label: "Finalizadas", val: query.isSuccess && !query.error ? sessions.filter(s => s.status === 'finalizada').length : '—', color: B.violet, bg: B.violetLight },
          { label: "Programadas", val: query.isSuccess && !query.error ? sessions.filter(s => s.status === 'programada').length : '—', color: B.teal, bg: B.tealLight },
          { label: "Con reporte", val: query.isSuccess && !query.error ? sessions.filter(s => s.report).length : '—', color: B.orange, bg: B.orangeLight },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Crd>
            <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: B.border }}>
              <h3 className="font-extrabold text-[#1C1135]">Sesiones registradas</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>{sessions.length} disponibles</span>
            </div>
            <div className="divide-y" style={{ borderColor: B.border }}>
              {query.isSuccess && !query.error && !sessions.length && <p className="p-5 text-sm text-[#7C6F9A]">Sin sesiones registradas.</p>}
              {sessions.map(s => (
                <div key={s.id} className={`p-4 flex items-center gap-4 flex-wrap transition-colors cursor-pointer ${selectedSession === s.id ? "bg-[#F5F3FF]" : "hover:bg-[#FAFAF9]"}`}
                  onClick={() => setSelectedSession(selectedSession === s.id ? null : s.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Av initials={s.therapistAv} color={s.therapistColor} size="sm" />
                    <div>
                      <p className="font-extrabold text-sm text-[#1C1135]">ID: {s.id}</p>
                      <p className="text-xs text-[#7C6F9A]">{s.name}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{s.started} · {s.dur}</p>
                    </div>
                  </div>
                  <Bdg color="violet">{s.type}</Bdg>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: s.status === "activa" ? "#D1FAE5" : B.violetLight, color: s.status === "activa" ? "#059669" : B.violet }}>
                    {s.status}
                  </span>
                  <span className="text-xs font-medium" style={{ color: s.quality === "excelente" ? "#059669" : B.teal }}>📶 {s.quality}</span>
                  {s.status === "activa" && (
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedSession(s.id); }}>
                      <Activity size={12} /> Detalle
                    </Btn>
                  )}
                </div>
              ))}
            </div>
          </Crd>
        </div>
        {/* Operational detail panel */}
        <div>
          {sel ? (
            <Crd className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-[#1C1135] text-sm">Detalle operativo</h4>
                <button onClick={() => setSelectedSession(null)} className="p-1 rounded-lg text-[#9E95B7] hover:bg-[#F5F3FF]"><X size={14} /></button>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { label: "ID de sesión",        val: sel.id },
                  { label: "Horario de inicio",   val: sel.started },
                  { label: "Duración",            val: sel.dur },
                  { label: "Modalidad",           val: sel.type },
                  { label: "Estado",              val: sel.status },
                  { label: "Calidad técnica",     val: sel.quality },
                  { label: "Latencia", val: sel.latency },
                  { label: "Incidencias", val: 'No disponible' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-[#F5F3FF] last:border-0">
                    <span className="text-[#9E95B7] font-medium">{r.label}</span>
                    <span className="font-extrabold text-[#1C1135]">{r.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl border text-xs font-medium" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1D4ED8" }}>
                🔒 El chat privado es exclusivo de sus participantes. El acceso al reporte clínico se verifica en el servidor.
              </div>
              <SessionActions key={sel.appointmentId} appointmentId={sel.appointmentId} />
            </Crd>
          ) : (
            <Crd className="p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: 220 }}>
              <Activity size={32} className="text-[#C4B5FD] mb-3" />
              <p className="text-sm font-extrabold text-[#9E95B7]">Selecciona una sesión</p>
              <p className="text-xs text-[#9E95B7] font-medium mt-1">Ver datos operativos</p>
            </Crd>
          )}
        </div>
      </div>
    </div>
  );
}
