import { useState } from "react";
import { Plus, X, Edit } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { useAppointments } from "@/hooks/useAppointments";
import { useWrite } from "@/hooks/useRemoteData";
import { appointmentsService } from "@/services/clinicalService";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { BookingDialog } from "@/components/common/BookingDialog";
import { SessionActions } from "@/components/common/SessionActions";
import type { Appointment } from "@/types/clinical";
import { Av } from "@/components/common/Av";

export function AdminCitas() {
  const [statusFilter, setStatusFilter] = useState("todas");
  const { query } = useAppointments();
  const [booking, setBooking] = useState<Appointment | 'new' | null>(null);
  const [detail, setDetail] = useState<number | null>(null);
  const change = useWrite(({ id, state }: { id: number; state: 'CONFIRMADA' | 'CANCELADA' }) => appointmentsService.state(id, state));
  const citas = (query.data ?? []).map(c => ({
    raw: c, id: c.id_reserva, patient: c.paciente_nombre, therapist: c.terapeuta_nombre,
    date: new Date(c.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' }),
    type: c.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial',
    status: c.estado_reserva.toLowerCase(), dur: `${Math.round((Date.parse(c.fecha_hora_fin) - Date.parse(c.fecha_hora_inicio))/60000)} min`,
    av: c.paciente_nombre.split(' ').map(n => n[0]).slice(0,2).join(''), color: B.violet,
  }));
  const scMap: Record<string, {bg:string; color:string}> = {
    confirmada: { bg: "#D1FAE5", color: "#059669" },
    pendiente:  { bg: B.orangeLight, color: B.orange },
    cancelada:  { bg: "#FEE2E2", color: "#DC2626" },
  };
  const statuses = ["todas", "confirmada", "pendiente", "cancelada", "completada"];
  const filtered = statusFilter === "todas" ? citas : citas.filter(c => c.status === statusFilter);
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={query.isPending} error={query.error || change.error} retry={() => void query.refetch()} />
      {booking && <BookingDialog appointment={booking === 'new' ? undefined : booking} close={() => setBooking(null)} />}
      {detail !== null && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"><button aria-label="Cerrar detalle" className="float-right p-2" onClick={() => setDetail(null)}><X size={16}/></button><SessionActions appointmentId={detail}/></div></div>}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Citas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Calendario global de la plataforma · America/Lima</p>
        </div>
        <Btn variant="primary" size="sm" onClick={() => setBooking('new')}><Plus size={13} /> Crear cita</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Confirmadas", val: citas.filter(c=>c.status==="confirmada").length, color: "#059669", bg: "#D1FAE5"     },
          { label: "Pendientes",  val: citas.filter(c=>c.status==="pendiente").length,  color: B.orange,  bg: B.orangeLight },
          { label: "Canceladas",  val: citas.filter(c=>c.status==="cancelada").length,  color: "#DC2626", bg: "#FEE2E2"     },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: statusFilter === s ? B.violet : B.violetLight, color: statusFilter === s ? "white" : B.textMid }}
            onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {!query.isPending && !query.error && filtered.length === 0 && <p className="text-sm text-[#7C6F9A] p-4">No hay citas para este filtro.</p>}
        {filtered.map((c, i) => {
          const sc = scMap[c.status] || { bg: B.violetLight, color: B.violet };
          return (
            <Crd key={i} className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Av initials={c.av} color={c.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{c.patient}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">con {c.therapist}</p>
                </div>
                <div className="text-xs text-[#7C6F9A] font-medium">{c.date} · {c.dur}</div>
                <Bdg color={c.type === "Virtual" ? "violet" : "gray"}>{c.type}</Bdg>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                <div className="flex gap-1 flex-wrap">
                  <Btn size="sm" variant="ghost" onClick={() => setDetail(c.id)}>Detalle</Btn>
                  {c.status === 'pendiente' && <Btn size="sm" disabled={change.isPending} onClick={() => void change.submit({ id: c.id, state: 'CONFIRMADA' })}>Confirmar</Btn>}
                  <button aria-label="Reprogramar cita" disabled={!!c.raw.id_sesion || !['pendiente', 'confirmada'].includes(c.status)} onClick={() => setBooking(c.raw)} className="disabled:opacity-40 p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit size={13} /></button>
                  <button aria-label="Cancelar cita" disabled={change.isPending || !!c.raw.id_sesion || !['pendiente', 'confirmada'].includes(c.status)} onClick={() => { if (window.confirm('¿Cancelar esta cita?')) void change.submit({ id: c.id, state: 'CANCELADA' }); }} className="disabled:opacity-40 p-1.5 rounded-xl text-[#9E95B7] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={13} /></button>
                </div>
              </div>
            </Crd>
          );
        })}
      </div>
    </div>
  );
}
