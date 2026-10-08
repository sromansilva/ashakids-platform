import type { usePadreAgenda } from "@/pages/padre/Padre/usePadreAgenda";
import { Star, ChevronLeft, ChevronRight, Plus, X, Check, Video, Download, ArrowRight, MapPin } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { therapists } from "@/mocks/demo";

// ─── Shared micro components ──────────────────────────────────────────────────
// ─── Shared micro components ──────────────────────────────────────────────────
import { Toast } from "@/pages/padre/Padre/Toast";
import { Modal } from "@/pages/padre/Padre/Modal";
import { ConfirmModal } from "@/pages/padre/Padre/ConfirmModal";
import { downloadPdf } from "@/pages/padre/Padre/downloadPdf";
import { MONTHS } from "@/pages/padre/Padre/MONTHS";
import { DAYS_LABEL } from "@/pages/padre/Padre/DAYS_LABEL";

type Props = Pick<ReturnType<typeof usePadreAgenda>, "toast" | "setToast" | "cancelId" | "cancelApt" | "setCancelId" | "month" | "year" | "pendingCount" | "setShowNew" | "setNewStep" | "prevMonth" | "nextMonth" | "firstDay" | "daysInMonth" | "today" | "aptDays" | "selDay" | "setSelDay" | "selectedApts" | "waitingApts" | "setApts" | "rejectedApts" | "go" | "confirmedApts" | "expandedReservationIds" | "setExpandedReservationIds" | "timelineSel" | "setTimelineSel" | "showNew" | "newStep" | "setNewTherapist" | "newTherapist" | "setNewModality" | "newModality" | "setNewChild" | "newChild" | "setNewDay" | "newDay" | "bookSlots" | "setNewTime" | "newTime" | "confirmNew">;
export function PadreAgendaMiAgenda({ toast, setToast, cancelId, cancelApt, setCancelId, month, year, pendingCount, setShowNew, setNewStep, prevMonth, nextMonth, firstDay, daysInMonth, today, aptDays, selDay, setSelDay, selectedApts, waitingApts, setApts, rejectedApts, go, confirmedApts, expandedReservationIds, setExpandedReservationIds, timelineSel, setTimelineSel, showNew, newStep, setNewTherapist, newTherapist, setNewModality, newModality, setNewChild, newChild, setNewDay, newDay, bookSlots, setNewTime, newTime, confirmNew }: Props) {
return (<div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
      {cancelId !== null && (
        <ConfirmModal
          title="Cancelar cita"
          desc="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
          onConfirm={() => cancelApt(cancelId!)}
          onClose={() => setCancelId(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Mi Agenda</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-[#7C6F9A] font-medium">{MONTHS[month]} · {year}</p>
            {pendingCount > 0 && <Bdg color="orange">{pendingCount} por confirmar</Bdg>}
          </div>
        </div>
        <Btn variant="cta" size="sm" onClick={() => { setShowNew(true); setNewStep(0); }}>
          <Plus size={14} /> Solicitar cita
        </Btn>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <Crd className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#1C1135]">{MONTHS[month]} {year}</h3>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 hover:bg-violet-50 rounded-xl transition-colors">
                <ChevronLeft size={15} className="text-[#7C6F9A]" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-violet-50 rounded-xl transition-colors">
                <ChevronRight size={15} className="text-[#7C6F9A]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS_LABEL.map(d => <div key={d} className="text-center text-xs text-[#9E95B7] font-extrabold py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasApt  = aptDays.has(day);
              const isSel   = selDay === day;
              return (
                <button key={day} onClick={() => setSelDay(d => d === day ? null : day)}
                  className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all relative font-bold
                    ${isToday ? "bg-violet-700 text-white" : isSel ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400" : "hover:bg-violet-50 text-[#1C1135]"}`}>
                  {day}
                  {hasApt && !isToday && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: B.orange }} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E5F4] flex items-center justify-between text-xs text-[#9E95B7] font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /> Cita agendada</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-700" /> Hoy</div>
          </div>
        </Crd>

        {/* Appointments card — same grid height as calendar */}
        <Crd className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#F5F3FF] flex items-center justify-between flex-shrink-0">
            <h3 className="font-extrabold text-[#1C1135]">
              {selDay ? `Citas del ${selDay} de ${MONTHS[month]}` : "Todas las citas"} ({selectedApts.length})
            </h3>
            {selDay && (
              <button onClick={() => setSelDay(null)} className="text-xs font-bold text-[#9E95B7] hover:text-violet-600 transition-colors">
                Ver todas
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {selectedApts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="font-extrabold text-[#1C1135] mb-1">Sin citas</p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-4">No hay citas para este período. ¿Quieres agendar una?</p>
                <Btn size="sm" variant="cta" onClick={() => setShowNew(true)}><Plus size={13} /> Solicitar cita</Btn>
              </div>
            )}
            {waitingApts.map((apt) => (
              <div key={apt.id} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-extrabold text-[#1C1135]">{apt.date} · {apt.time}</p><p className="text-xs text-[#7C6F9A] font-medium mt-1">{apt.therapist} · {apt.child} · {apt.type === "presencial" ? "📍 Presencial" : "💻 Virtual"}</p></div><Bdg color="orange">Por confirmar</Bdg></div>
                <div className="mt-3 flex justify-end"><Btn size="sm" variant="secondary" onClick={() => { setApts(current => current.map(item => item.id === apt.id ? { ...item, status: "confirmada", paymentStatus: "pendiente" } : item)); setToast("Demo: la terapeuta confirmó la sesión. Ya está disponible en Pagos."); }}><Check size={12} /> Simular confirmación</Btn></div>
              </div>
            ))}
            {rejectedApts.map((apt) => (
              <div key={apt.id} className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-extrabold text-[#1C1135]">{apt.date} · {apt.time}</p><p className="text-xs text-[#7C6F9A] font-medium mt-1">{apt.therapist} · {apt.child} · {apt.type === "presencial" ? "📍 Presencial" : "💻 Virtual"}</p></div>
                  <Bdg color="red">Rechazada</Bdg>
                </div>
                <p className="text-xs text-red-600 font-medium mt-2">El terapeuta no pudo aceptar esta solicitud. Puedes elegir otro horario o terapeuta.</p>
                <div className="mt-3 flex justify-end gap-2">
                  <Btn size="sm" variant="outline" onClick={() => setApts(prev => prev.filter(a => a.id !== apt.id))}>
                    <X size={12} /> Descartar
                  </Btn>
                  <Btn size="sm" variant="primary" onClick={() => go("padre/psicologos")}>
                    <Plus size={12} /> Nueva solicitud
                  </Btn>
                </div>
              </div>
            ))}
            {confirmedApts.length > 0 && <p className="px-1 pt-2 text-xs font-extrabold uppercase tracking-wider text-[#9E95B7]">Detalle de la reserva</p>}
            {confirmedApts.map((apt) => {
              const isExpanded = expandedReservationIds.includes(apt.id);
              const detailsId = `reservation-details-${apt.id}`;
              return <div key={apt.id} className="rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden transition-shadow hover:shadow-sm">
                <button type="button" onClick={() => setExpandedReservationIds((current) => current.includes(apt.id) ? current.filter((id) => id !== apt.id) : [...current, apt.id])} aria-expanded={isExpanded} aria-controls={detailsId} className="w-full min-h-12 p-4 flex items-center gap-3 text-left hover:bg-[#FAFAF9] focus-visible:ring-2 focus-visible:ring-violet-500">
                  <Av initials={apt.therapist.split(" ").map((word) => word[0]).join("").slice(0, 2)} color={B.violet} size="sm" />
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-[#1C1135] truncate">{apt.date} · {apt.time}</p><p className="text-xs text-[#7C6F9A] font-medium truncate mt-0.5">{apt.therapist} · {apt.child} · {apt.type === "presencial" ? "📍 Presencial" : "💻 Virtual"}</p></div>
                  <Bdg color="green">Confirmada</Bdg><ChevronRight size={17} className={`shrink-0 text-[#7C6F9A] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
                {isExpanded && <div id={detailsId} className="border-t border-[#F5F3FF] px-4 pb-4 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 text-sm text-[#7C6F9A] font-medium"><p><span className="font-bold text-[#1C1135]">Terapeuta:</span> {apt.therapist}</p><p><span className="font-bold text-[#1C1135]">Niño:</span> {apt.child}</p><p><span className="font-bold text-[#1C1135]">Fecha:</span> {apt.date}</p><p><span className="font-bold text-[#1C1135]">Hora y duración:</span> {apt.time} · 45 min</p><p><span className="font-bold text-[#1C1135]">Modalidad:</span> {apt.type === "presencial" ? "Presencial" : "Virtual"}</p><p><span className="font-bold text-[#1C1135]">Referencia:</span> ASHA-{String(apt.id).slice(-6)}</p></div>
                  {apt.type === "presencial" && (
                    <div className="mt-3 rounded-xl p-3 flex items-start gap-2 border border-teal-100" style={{background:"#F0FDFA"}}>
                      <span className="text-base">📍</span>
                      <div>
                        <p className="text-sm font-extrabold text-[#1C1135]">Integrakids Perú</p>
                        <p className="text-xs text-[#7C6F9A] font-medium">Jr. Ricardo Treneman 252, Chorrillos 15064</p>
                        <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer" className="text-xs font-extrabold hover:underline" style={{color:"#0D9488"}}>Ver en Google Maps →</a>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end gap-2">
                    <Btn size="sm" variant="outline" onClick={() => setCancelId(apt.id)}><X size={12} /> Cancelar</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => downloadPdf(`notas-${String(apt.id).slice(-6)}.txt`, `Notas de sesión · ASHA-${String(apt.id).slice(-6)}`, [`Terapeuta: ${apt.therapist}`, `Niño: ${apt.child}`, `Fecha: ${apt.date}`, `Hora: ${apt.time} · 45 min`, `Modalidad: ${apt.type === "presencial" ? "Presencial" : "Virtual"}`, `Especialidad: ${apt.specialty}`])}><Download size={12} /> Descargar notas</Btn>
                    {apt.type === "presencial"
                      ? <Btn size="sm" variant="cta" onClick={() => window.open("https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064","_blank")}><MapPin size={12} /> Cómo llegar</Btn>
                      : <Btn size="sm" variant="cta" onClick={() => go("session")}><Video size={12} /> Unirse</Btn>
                    }
                  </div>
                </div>}
              </div>;
            })}
          </div>
        </Crd>
      </div>

      {/* ── Timeline horizontal ── */}
      <Crd className="p-5 mt-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-[#1C1135]">Línea de tiempo</h3>
            <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
              {selDay ? `${selDay} de ${MONTHS[month]} ${year}` : `${MONTHS[month]} ${year}`}
              {" · "}{selectedApts.length} {selectedApts.length === 1 ? "cita" : "citas"}
            </p>
          </div>
          {timelineSel && (
            <button onClick={() => setTimelineSel(null)} className="p-1.5 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Horizontal scroll rail */}
        <div className="overflow-x-auto pb-1">
          <div className="relative" style={{ width: `${10 * 92}px`, height: 100 }}>
            {/* Hour columns */}
            {Array.from({ length: 11 }, (_, i) => 8 + i).map(hour => (
              <div key={hour} className="absolute top-0 bottom-0"
                style={{ left: `${(hour - 8) * 92}px` }}>
                <div className="h-full border-l border-dashed border-[#E8E5F4]" />
                <span className="absolute top-0 left-1.5 text-[10px] text-[#9E95B7] font-bold whitespace-nowrap">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {/* Appointment boxes */}
            {selectedApts.map(apt => {
              const [h, m] = apt.time.split(":").map(Number);
              const leftPx = ((h - 8) + m / 60) * 92;
              const isSel = timelineSel?.id === apt.id;
              const isVirtual = apt.type === "virtual";
              return (
                <button key={apt.id}
                  onClick={() => setTimelineSel(isSel ? null : apt)}
                  className="absolute top-7 rounded-2xl px-3 py-2 border text-left transition-all active:scale-95"
                  style={{
                    left: leftPx,
                    background: isSel
                      ? (isVirtual ? "rgba(196,181,253,0.65)" : "rgba(147,197,253,0.65)")
                      : (isVirtual ? "rgba(196,181,253,0.28)" : "rgba(147,197,253,0.28)"),
                    borderColor: isVirtual ? "#c4b5fd" : "#7dd3fc",
                    minWidth: 110,
                    boxShadow: isSel ? "0 4px 14px rgba(0,0,0,0.10)" : undefined,
                    transform: isSel ? "scale(1.03)" : undefined,
                    zIndex: isSel ? 10 : 1,
                  }}>
                  <p className="text-xs font-extrabold text-[#1C1135] whitespace-nowrap">{apt.time}</p>
                  <p className="text-[11px] text-[#7C6F9A] font-medium whitespace-nowrap">{apt.therapist.split(" ").slice(-1)[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini card on selection */}
        {timelineSel && (
          <div className="mt-4 rounded-2xl border p-4 flex items-center justify-between gap-3 transition-all"
            style={{ background: "rgba(196,181,253,0.15)", borderColor: "#c4b5fd" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,181,253,0.45)" }}>
                <Video size={17} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-[#1C1135] text-sm leading-tight truncate">
                  {timelineSel.time} · {timelineSel.therapist}
                </p>
                <p className="text-xs text-[#7C6F9A] font-medium truncate">
                  {timelineSel.specialty} · 45 min · {timelineSel.date}
                </p>
              </div>
            </div>
            <Btn size="sm" variant="cta" onClick={() => go("session")}>
              <Video size={12} /> Unirse
            </Btn>
          </div>
        )}
      </Crd>

      {/* Solicitar cita modal */}
      {showNew && (
        <Modal title={["Elegir terapeuta", "Elegir modalidad", "Elegir fecha y hora", "Enviar solicitud"][newStep]} onClose={() => setShowNew(false)} wide>
          <div className="p-6">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {["Terapeuta", "Modalidad", "Fecha y hora", "Solicitar"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-all"
                    style={{ background: i <= newStep ? B.violet : "#E8E5F4", color: i <= newStep ? "white" : B.textMuted }}>
                    {i < newStep ? <Check size={9} /> : i + 1}
                  </div>
                  <span className="text-xs font-bold hidden sm:block" style={{ color: i <= newStep ? B.violet : B.textMuted }}>{s}</span>
                  {i < 3 && <div className="flex-1 h-px" style={{ background: i < newStep ? B.violet : "#E8E5F4" }} />}
                </div>
              ))}
            </div>

            {newStep === 0 && (
              <div className="flex flex-col gap-3">
                {therapists.filter(t => t.available).map(t => (
                  <button key={t.id} onClick={() => setNewTherapist(t.name)}
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:shadow-sm"
                    style={{ borderColor: newTherapist === t.name ? B.violet : B.border, background: newTherapist === t.name ? B.violetLight : "white" }}>
                    <Av initials={t.av} color={t.color} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[#1C1135]">{t.name}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{t.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-[#1C1135]">{t.rating}</span>
                    </div>
                    {newTherapist === t.name && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: B.violet }}><Check size={10} color="white" /></div>}
                  </button>
                ))}
                <Btn variant="primary" className="w-full justify-center mt-2" disabled={!newTherapist} onClick={() => setNewStep(1)}>
                  Continuar <ArrowRight size={15} />
                </Btn>
              </div>
            )}

            {newStep === 1 && (
              <div>
                <p className="text-sm font-extrabold text-[#1C1135] mb-4">¿Cómo quieres realizar la sesión?</p>
                <div className="flex flex-col gap-3 mb-5">
                  <button onClick={() => setNewModality("virtual")}
                    className="flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                    style={{ borderColor: newModality === "virtual" ? B.violet : B.border, background: newModality === "virtual" ? B.violetLight : "white" }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: newModality === "virtual" ? B.violet : "#F5F3FF" }}>
                      <span style={{ filter: newModality === "virtual" ? "brightness(10)" : "none" }}>💻</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-[#1C1135] mb-0.5">Virtual</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">Sesión por videollamada a través de ASHA Session. Conéctate desde casa.</p>
                    </div>
                    {newModality === "virtual" && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: B.violet }}><Check size={10} color="white" /></div>}
                  </button>
                  <button onClick={() => setNewModality("presencial")}
                    className="flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                    style={{ borderColor: newModality === "presencial" ? B.teal : B.border, background: newModality === "presencial" ? B.tealLight : "white" }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: newModality === "presencial" ? B.teal : "#F0FDFA" }}>
                      <span style={{ filter: newModality === "presencial" ? "brightness(10)" : "none" }}>🏥</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-[#1C1135] mb-0.5">Presencial</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">Asiste al centro de terapia. Sesión en consultorio con la terapeuta.</p>
                    </div>
                    {newModality === "presencial" && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: B.teal }}><Check size={10} color="white" /></div>}
                  </button>
                </div>
                {newModality === "presencial" && (
                  <div className="rounded-2xl p-4 mb-4 border border-teal-100" style={{ background: "#F0FDFA" }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="font-extrabold text-[#1C1135] text-sm mb-0.5">Integrakids Perú</p>
                        <p className="text-xs text-[#7C6F9A] font-medium mb-2">Centro de terapia sensorial · terapia ocupacional · terapia de lenguaje · terapia psicológica para niños</p>
                        <p className="text-xs font-bold text-[#1C1135] mb-2">Jr. Ricardo Treneman 252, Chorrillos 15064</p>
                        <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90"
                          style={{ background: B.teal }}>
                          <MapPin size={11} /> Ver en Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Btn variant="outline" className="flex-1 justify-center" onClick={() => setNewStep(0)}>
                    <ChevronLeft size={14} /> Atrás
                  </Btn>
                  <Btn variant="primary" className="flex-1 justify-center" disabled={!newModality} onClick={() => setNewStep(2)}>
                    Continuar <ArrowRight size={15} />
                  </Btn>
                </div>
              </div>
            )}

            {newStep === 2 && (
              <div>
                <p className="text-sm font-extrabold text-[#1C1135] mb-3">¿Para qué hijo?</p>
                <div className="flex gap-2 mb-5">
                  {["Mateo", "Sofía"].map(k => (
                    <button key={k} onClick={() => setNewChild(k)}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all"
                      style={{ borderColor: newChild === k ? B.violet : B.border, background: newChild === k ? B.violetLight : "white", color: newChild === k ? B.violet : B.textMid }}>
                      {k}
                    </button>
                  ))}
                </div>
                <p className="text-sm font-extrabold text-[#1C1135] mb-3">Día del mes</p>
                <div className="grid grid-cols-7 gap-1 mb-5">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                    <button key={d} onClick={() => setNewDay(d)}
                      className="aspect-square rounded-xl text-xs font-bold border transition-all"
                      style={{ borderColor: newDay === d ? B.violet : "transparent", background: newDay === d ? B.violetLight : B.bg, color: newDay === d ? B.violet : B.textMid }}>
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-sm font-extrabold text-[#1C1135] mb-3">Horario</p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {bookSlots.map(s => (
                    <button key={s} onClick={() => setNewTime(s)}
                      className="rounded-xl py-2.5 text-xs font-bold border-2 transition-all"
                      style={{ borderColor: newTime === s ? B.teal : B.border, background: newTime === s ? B.tealLight : "white", color: newTime === s ? B.teal : B.textMid }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Btn variant="outline" className="flex-1 justify-center" onClick={() => setNewStep(1)}>
                    <ChevronLeft size={14} /> Atrás
                  </Btn>
                  <Btn variant="primary" className="flex-1 justify-center" disabled={!newDay || !newTime} onClick={() => setNewStep(3)}>
                    Revisar cita <ArrowRight size={15} />
                  </Btn>
                </div>
              </div>
            )}

            {newStep === 3 && (
              <div>
                <div className="rounded-2xl p-5 border border-[#E8E5F4] mb-4">
                  {[
                    { l: "Terapeuta", v: newTherapist },
                    { l: "Para", v: newChild },
                    { l: "Fecha", v: `${newDay} de ${MONTHS[month]} ${year}` },
                    { l: "Hora", v: newTime },
                    { l: "Duración", v: "45 minutos" },
                    { l: "Modalidad", v: newModality === "presencial" ? "Presencial" : "Virtual (ASHA Session)" },
                  ].map(r => (
                    <div key={r.l} className="flex justify-between py-2.5 border-b border-[#F5F3FF] last:border-0">
                      <span className="text-sm font-bold text-[#9E95B7]">{r.l}</span>
                      <span className="text-sm font-extrabold text-[#1C1135]">{r.v}</span>
                    </div>
                  ))}
                </div>
                {newModality === "presencial" && (
                  <div className="rounded-2xl p-4 mb-4 border border-teal-100 flex items-start gap-3" style={{ background: "#F0FDFA" }}>
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="text-sm font-extrabold text-[#1C1135] mb-0.5">Integrakids Perú</p>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-1">Jr. Ricardo Treneman 252, Chorrillos 15064</p>
                      <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer"
                        className="text-xs font-extrabold hover:underline" style={{ color: B.teal }}>Ver en Google Maps →</a>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Btn variant="outline" className="flex-1 justify-center" onClick={() => setNewStep(2)}>
                    <ChevronLeft size={14} /> Atrás
                  </Btn>
                  <Btn variant="cta" className="flex-1 justify-center" onClick={confirmNew}>
                    <Check size={14} /> Enviar solicitud
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>);
}
