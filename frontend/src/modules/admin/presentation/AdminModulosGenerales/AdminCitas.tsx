import { useState } from "react";
import { X } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Crd } from "@/shared/presentation/components/common/Crd";
import { Bdg } from "@/shared/presentation/components/common/Bdg";
import { useAppointments } from "@/shared/application/hooks/useAppointments";
import { RemoteFeedback } from "@/shared/presentation/components/common/RemoteFeedback";
import { SessionActions } from "@/shared/presentation/components/common/SessionActions";
import { Av } from "@/shared/presentation/components/common/Av";

export function AdminCitas() {
  const [statusFilter, setStatusFilter] = useState("todas");
  const [therapistFilter, setTherapistFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { query } = useAppointments();
  const [detail, setDetail] = useState<number | null>(null);
  const appointments = query.error ? [] : query.data ?? [];
  const therapists = Array.from(new Map(appointments.map(c => [c.id_terapeuta, c.terapeuta_nombre])).entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const citas = appointments.map(c => ({
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
  const invalidRange = !!fromDate && !!toDate && fromDate > toDate;
  const filtered = invalidRange ? [] : citas.filter(c =>
    (statusFilter === 'todas' || c.status === statusFilter) &&
    (!therapistFilter || String(c.raw.id_terapeuta) === therapistFilter) &&
    (!modalityFilter || c.raw.modalidad === modalityFilter) &&
    (!fromDate || Date.parse(c.raw.fecha_hora_inicio) >= Date.parse(`${fromDate}T00:00:00-05:00`)) &&
    (!toDate || Date.parse(c.raw.fecha_hora_inicio) <= Date.parse(`${toDate}T23:59:59.999-05:00`)));
  const clearFilters = () => { setStatusFilter('todas'); setTherapistFilter(''); setModalityFilter(''); setFromDate(''); setToDate(''); };
  const fieldClass = 'w-full mt-2 rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm text-[#1C1135] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600';
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
      {detail !== null && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"><button aria-label="Cerrar detalle" className="float-right p-2" onClick={() => setDetail(null)}><X size={16}/></button><SessionActions appointmentId={detail}/></div></div>}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Citas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Calendario global de la plataforma · America/Lima</p>
        </div>
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
      <div className="rounded-2xl bg-white p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-sm font-bold text-[#1C1135]">Terapeuta
            <select className={fieldClass} value={therapistFilter} onChange={e => setTherapistFilter(e.target.value)}>
              <option value="">Todos los terapeutas</option>
              {therapists.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-[#1C1135]">Modalidad
            <select className={fieldClass} value={modalityFilter} onChange={e => setModalityFilter(e.target.value)}>
              <option value="">Todas las modalidades</option><option value="PRESENCIAL">Presencial</option><option value="VIRTUAL">Virtual</option>
            </select>
          </label>
          <label className="text-sm font-bold text-[#1C1135]">Desde
            <input type="date" className={fieldClass} value={fromDate} onChange={e => setFromDate(e.target.value)} aria-describedby="appointment-date-help" />
          </label>
          <label className="text-sm font-bold text-[#1C1135]">Hasta
            <input type="date" className={fieldClass} value={toDate} onChange={e => setToDate(e.target.value)} aria-invalid={invalidRange} aria-describedby="appointment-date-help" />
          </label>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
          <p id="appointment-date-help" className="text-xs text-[#625779]">Filtra por inicio de la cita. Ambas fechas incluyen el día completo en horario de Lima.</p>
          <Btn size="sm" variant="secondary" onClick={clearFilters}>Limpiar filtros</Btn>
        </div>
        {invalidRange && <p role="alert" className="text-sm text-red-800 mt-3">La fecha hasta debe ser igual o posterior a la fecha desde.</p>}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: statusFilter === s ? B.violet : B.violetLight, color: statusFilter === s ? "white" : B.textMid }}
            aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {!query.isPending && !query.error && !invalidRange && <p className="text-sm text-[#625779]" role="status">Mostrando {filtered.length} de {citas.length} citas.</p>}
        {!query.isPending && !query.error && !invalidRange && filtered.length === 0 && <p className="text-sm text-[#7C6F9A] p-4">No hay citas para estos filtros.</p>}
        {filtered.map(c => {
          const sc = scMap[c.status] || { bg: B.violetLight, color: B.violet };
          return (
            <Crd key={c.id} className="p-4">
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
                </div>
              </div>
            </Crd>
          );
        })}
      </div>
    </div>
  );
}
