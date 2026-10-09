import { useState } from "react";
import type { AppointmentRequest } from "@/types/AppointmentRequest";
import { Calendar, ChevronLeft, ChevronRight, Video, X, Clock, Check } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { useAppointments } from "@/hooks/useAppointments";
import { useWrite } from "@/hooks/useRemoteData";
import { appointmentsService } from "@/services/clinicalService";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import { SessionActions } from "@/components/common/SessionActions";

// ─── Calendar helpers ──────────────────────────────────────────────────────────
const MONTHS_ES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MONTHS_ES_FULL  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_NAMES_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function parseCalDate(s: string): Date | null {
  const p = s.trim().split(" ");
  if (p.length !== 3) return null;
  const d = parseInt(p[0]);
  const m = MONTHS_ES_SHORT.findIndex(x => x === p[1]);
  const y = parseInt(p[2]);
  return m === -1 || isNaN(d) || isNaN(y) ? null : new Date(y, m, d);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
function formatMonthYear(d: Date) { return `${MONTHS_ES_FULL[d.getMonth()]} ${d.getFullYear()}`; }
function formatDateLabel(d: Date) { return `${String(d.getDate()).padStart(2,"0")} ${MONTHS_ES_SHORT[d.getMonth()]} ${d.getFullYear()}`; }

const CAL_COLORS = ["#7C3AED","#0D9488","#22C55E","#F97316","#8B5CF6","#EC4899"];
function childColor(name: string) {
  let h = 0;
  for (const c of name) h = ((h * 31) + c.charCodeAt(0)) | 0;
  return CAL_COLORS[Math.abs(h) % CAL_COLORS.length];
}

const DEMO_TODAY = new Date();

// ─── TerapeutaAgenda ──────────────────────────────────────────────────────────

export function TerapeutaAgenda({ go }: { go: (v: View) => void; requests?: AppointmentRequest[]; onRequestUpdate?: (id: number, status: "confirmada" | "rechazada") => void }) {
  const { query, appointments: incomingRequests } = useAppointments();
  const [agView, setAgView]       = useState<"dia" | "semana">("semana");
  const [selDate, setSelDate]     = useState<Date>(DEMO_TODAY);
  const [requestNotice, setRequestNotice] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<null | { id: number; patient: string; time: string; date: string; type: string }>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const update = useWrite(({ id, state }: { id: number; state: 'CONFIRMADA' | 'CANCELADA' }) => appointmentsService.state(id, state), () => {
    setRequestNotice('Estado actualizado en el servidor.');
    void query.refetch();
    setShowCancelModal(false); setSelectedEvent(null); setCancelReason('');
  });

  const pendingRequests  = incomingRequests.filter(r => r.status === "por confirmar");
  const confirmedApts    = incomingRequests.filter(r => r.status === "confirmada");

  const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  // ── Navigation ──────────────────────────────────────────────────────────────
  function navigate(dir: 1 | -1) {
    setSelDate(d => {
      const next = new Date(d);
      next.setDate(d.getDate() + (agView === "semana" ? dir * 7 : dir));
      return next;
    });
  }

  // ── Week days (Mon–Sun) ─────────────────────────────────────────────────────
  const monday   = getMondayOf(selDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  // ── Appointment helpers ─────────────────────────────────────────────────────
  function isCancelled(apt: AppointmentRequest) { return apt.status === 'cancelada'; }

  function aptForSlot(day: Date, hour: number): AppointmentRequest | undefined {
    return confirmedApts.find(apt => {
      const d = parseCalDate(apt.date);
      return d && isSameDay(d, day) && parseInt(apt.time) === hour && !isCancelled(apt);
    });
  }

  function aptsForDay(day: Date): AppointmentRequest[] {
    return confirmedApts
      .filter(apt => { const d = parseCalDate(apt.date); return d && isSameDay(d, day) && !isCancelled(apt); })
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  const headerLabel = agView === "semana"
    ? formatMonthYear(monday)
    : `${DAY_NAMES_SHORT[selDate.getDay()]}, ${selDate.getDate()} de ${MONTHS_ES_FULL[selDate.getMonth()]} ${selDate.getFullYear()}`;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <RemoteFeedback pending={query.isPending} error={query.error || update.error} retry={() => void query.refetch()} />
      <p className="text-xs text-[#7C6F9A] mb-2">Horarios en America/Lima</p>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Agenda</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{headerLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Día / Semana toggle */}
          <div className="flex rounded-2xl overflow-hidden border" style={{ borderColor: B.border }}>
            {(["dia","semana"] as const).map(v => (
              <button key={v}
                className="px-4 py-2 text-sm font-bold transition-all"
                style={{ background: agView === v ? B.violet : "white", color: agView === v ? "white" : B.textMid }}
                onClick={() => setAgView(v)}>
                {v === "dia" ? "Día" : "Semana"}
              </button>
            ))}
          </div>
          {/* Prev / Hoy / Next */}
          <div className="flex items-center gap-0.5 bg-white border border-[#E8E5F4] rounded-2xl px-1 py-1">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-violet-50 text-[#7C6F9A] transition-colors" aria-label="Anterior">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setSelDate(DEMO_TODAY)} className="px-2.5 py-1 text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 rounded-lg transition-colors">
              Hoy
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-xl hover:bg-violet-50 text-[#7C6F9A] transition-colors" aria-label="Siguiente">
              <ChevronRight size={16} />
            </button>
          </div>
          <Btn variant="outline" size="sm" onClick={() => go("terapeuta/config")}><Clock size={13} /> Horarios</Btn>
        </div>
      </div>

      {/* ── Notice ── */}
      {requestNotice && (
        <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-800 bg-emerald-100">✓ {requestNotice}</div>
      )}

      {/* ── Pending requests ── */}
      {pendingRequests.length > 0 && (
        <Crd className="p-4 mb-5 border-2 border-orange-100" style={{ background: "#FFFBEB" }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-extrabold text-[#1C1135]">Solicitudes de cita</h3>
              <p className="text-xs text-[#7C6F9A] font-medium">Revisa y confirma las solicitudes de los representantes.</p>
            </div>
            <Bdg color="orange">{pendingRequests.length} pendientes</Bdg>
          </div>
          <div className="flex flex-col gap-2">
            {pendingRequests.map(req => {
              const initials   = req.child.split(" ").map((p: string) => p[0]).join("").slice(0, 2);
              const parentLabel = req.parent ?? "Tutor";
              return (
                <div key={req.id} className="flex items-center gap-3 rounded-2xl p-3 bg-white border border-orange-100 flex-wrap">
                  <Av initials={initials} color={B.orange} size="sm" />
                  <div className="flex-1 min-w-40">
                    <p className="text-sm font-extrabold text-[#1C1135]">{req.child}</p>
                    <p className="text-xs text-[#7C6F9A]">{parentLabel} · {req.date} · {req.time}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                      style={req.type === "presencial" ? { background:"#F0FDFA", color:"#0D9488" } : { background:"#EDE9FE", color:"#7C3AED" }}>
                      {req.type === "presencial" ? "📍 Presencial" : "💻 Virtual"}
                    </span>
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => go("terapeuta/mensajes")}>Más información</Btn>
                  <Btn size="sm" variant="outline" disabled={update.isPending} onClick={() => { void update.submit({ id: req.id, state: 'CANCELADA' }); }}>
                    <X size={12} /> Rechazar
                  </Btn>
                  <Btn size="sm" variant="primary" disabled={update.isPending} onClick={() => { void update.submit({ id: req.id, state: 'CONFIRMADA' }); }}>
                    <Check size={12} /> Aceptar
                  </Btn>
                </div>
              );
            })}
          </div>
        </Crd>
      )}

      {/* ── SEMANA view ── */}
      {agView === "semana" && (
        <Crd className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Day headers */}
              <div className="grid border-b" style={{ gridTemplateColumns: "64px repeat(7, 1fr)", borderColor: B.border }}>
                <div className="p-3 border-r" style={{ borderColor: B.border }} />
                {weekDays.map((wd, i) => {
                  const today  = isSameDay(wd, DEMO_TODAY);
                  const active = isSameDay(wd, selDate);
                  return (
                    <button
                      key={i}
                      className="p-3 text-center border-r last:border-0 hover:bg-violet-50 transition-colors"
                      style={{ borderColor: B.border }}
                      onClick={() => { setSelDate(wd); setAgView("dia"); }}
                    >
                      <p className="text-xs font-medium" style={{ color: B.textMuted }}>{DAY_NAMES_SHORT[wd.getDay()]}</p>
                      <p className={`font-extrabold text-sm mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all
                        ${today ? "text-white" : active ? "text-violet-700 bg-violet-100" : "text-[#1C1135]"}`}
                        style={today ? { background: B.violet } : {}}>
                        {wd.getDate()}
                      </p>
                    </button>
                  );
                })}
              </div>
              {/* Time grid */}
              <div className="overflow-y-auto" style={{ maxHeight: 440 }}>
                {hours.map((h, hi) => (
                  <div key={h} className="grid border-b last:border-0" style={{ gridTemplateColumns: "64px repeat(7, 1fr)", borderColor: B.border, minHeight: 52 }}>
                    <div className="p-2 text-right pr-3 border-r text-xs font-medium pt-3" style={{ borderColor: B.border, color: B.textMuted }}>{h}</div>
                    {weekDays.map((wd, di) => {
                      const apt = aptForSlot(wd, hi + 8);
                      const col = apt ? childColor(apt.child) : "";
                      return (
                        <div key={di} className="relative border-r last:border-0 p-1" style={{ borderColor: B.border }}>
                          {apt && (
                            <div
                              className="rounded-xl px-2 py-1.5 cursor-pointer hover:brightness-95 transition-all"
                              style={{ background: `${col}20`, borderLeft: `3px solid ${col}` }}
                              onClick={() => setSelectedEvent({ id: apt.id, patient: apt.child, time: apt.time, date: apt.date, type: apt.type })}
                            >
                              <p className="text-[11px] font-extrabold truncate" style={{ color: col }}>{apt.child.split(" ")[0]}</p>
                              <p className="text-[10px] font-medium truncate" style={{ color: col + "aa" }}>{apt.time}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Crd>
      )}

      {/* ── DÍA view ── */}
      {agView === "dia" && (() => {
        const dayApts = aptsForDay(selDate);
        return (
          <div className="flex flex-col gap-3">
            {dayApts.length === 0 && (
              <Crd className="p-10 flex flex-col items-center gap-3">
                <Calendar size={32} className="text-[#C4BDD8]" />
                <p className="text-sm font-bold text-[#9E95B7]">Sin citas este día</p>
                <p className="text-xs text-[#C4BDD8] font-medium">Usa las flechas para navegar a otro día</p>
              </Crd>
            )}
            {dayApts.map((apt, i) => {
              const col = childColor(apt.child);
              return (
                <Crd key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${col}20` }}>
                      {apt.type === "presencial"
                        ? <span className="text-xl">📍</span>
                        : <Video size={20} style={{ color: col }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[#1C1135]">{apt.child}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{apt.time} · {apt.type === "presencial" ? "Presencial" : "Virtual"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Btn size="sm" variant="outline" onClick={() => setSelectedEvent({ id: apt.id, patient: apt.child, time: apt.time, date: apt.date, type: apt.type })}>
                        Ver detalle
                      </Btn>
                      <Btn size="sm" variant="primary" onClick={() => go("session")}>
                        <Video size={12} /> Entrar
                      </Btn>
                    </div>
                  </div>
                </Crd>
              );
            })}
          </div>
        );
      })()}

      {/* ── Event detail modal ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4]">
              <h3 className="font-extrabold text-[#1C1135]">Sesión programada</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-6">
              <div className="rounded-2xl p-4 mb-5" style={{ background: "#F5F0FF" }}>
                <p className="font-extrabold text-[#1C1135]">{selectedEvent.patient}</p>
                <p className="text-sm text-[#7C6F9A] mt-0.5">{selectedEvent.date} · {selectedEvent.time}</p>
                <span className="inline-block mt-1.5 text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                  style={selectedEvent.type === "presencial" ? { background:"#F0FDFA", color:"#0D9488" } : { background:"#EDE9FE", color:"#7C3AED" }}>
                  {selectedEvent.type === "presencial" ? "📍 Presencial" : "💻 Virtual"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <SessionActions appointmentId={selectedEvent.id} />
                <button
                  onClick={() => { setSelectedEvent(null); go("session"); }}
                  className="w-full py-3 rounded-2xl font-extrabold text-white text-sm transition-all"
                  style={{ background: "#7C3AED" }}
                >
                  Ir a reunión
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 rounded-2xl font-extrabold text-sm border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all"
                >
                  Cancelar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel modal ── */}
      {showCancelModal && selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4]">
              <h3 className="font-extrabold text-[#1C1135]">Motivo de cancelación</h3>
              <button onClick={() => setShowCancelModal(false)} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7C6F9A] mb-3">Describe el motivo para cancelar la sesión con {selectedEvent.patient}.</p>
              <p className="text-xs text-[#7C6F9A] mb-3">La API guarda la cancelación, pero todavía no almacena este motivo.</p>
              <RemoteFeedback error={update.error} />
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Ej: Emergencia personal, cambio de horario..."
                className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-gray-50">
                  Mantener
                </button>
                <button
                  disabled={!cancelReason.trim() || update.isPending}
                  onClick={() => {
                    void update.submit({ id: selectedEvent.id, state: 'CANCELADA' });
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

