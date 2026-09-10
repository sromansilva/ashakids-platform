import { useState, useRef, useEffect } from "react";
import {
  Search, Star, Heart, ChevronLeft, ChevronRight, Plus, X, Check,
  Video, Phone, Send, Paperclip, Download, CreditCard, Clock,
  MessageCircle, Calendar, ArrowRight, CheckCircle, Globe,
  AlertTriangle, FileText, Share2, MapPin,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Inp, therapists, appointments, msgs } from "../shared";

// ─── Shared micro components ──────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold animate-bounce-in"
      style={{ background: "linear-gradient(135deg, #059669, #0D9488)", boxShadow: "0 8px 32px rgba(5,150,105,.35)" }}>
      <CheckCircle size={16} /> {msg}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function Modal({ title, onClose, children, wide = false }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh] ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
          <h2 className="font-extrabold text-[#1C1135] text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F5F3FF] transition-colors text-[#9E95B7]"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, desc, onConfirm, onClose, danger = false }: {
  title: string; desc: string; onConfirm: () => void; onClose: () => void; danger?: boolean;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl" style={{ background: danger ? "#FEE2E2" : B.warningLight }}>
            {danger ? "🗑️" : "⚠️"}
          </div>
        </div>
        <p className="text-sm text-[#7C6F9A] font-medium text-center mb-6 leading-relaxed">{desc}</p>
        <div className="flex gap-3">
          <Btn variant="outline" className="flex-1 justify-center" onClick={onClose}>Cancelar</Btn>
          <button onClick={onConfirm} className={`flex-1 rounded-2xl py-2.5 text-sm font-extrabold text-white transition-all active:scale-[.97] ${danger ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
            {danger ? "Sí, eliminar" : "Confirmar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── PDF helper ───────────────────────────────────────────────────────────────

function downloadPdf(filename: string, title: string, lines: string[]) {
  const text = [title, "═".repeat(48), ...lines, "", "Generado por AshaApp · " + new Date().toLocaleDateString("es")].join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── 1. Especialistas / Terapeutas ────────────────────────────────────────────

const SPECIALTIES = ["Todas", "Terapia del Lenguaje", "Articulación", "Fonología", "Comprensión", "Fluidez", "Comunicación"];

export type AppointmentRequest = {
  id: number;
  therapist: string;
  specialty: string;
  child: string;
  parent?: string;
  date: string;
  time: string;
  type: "virtual" | "presencial";
  status: "por confirmar" | "confirmada" | "cancelada" | "rechazada";
  paymentStatus?: "pendiente" | "pagada";
};

export function PadrePsicologos({ go, onRequest, bookedSlots = [] }: { go: (v: View) => void; onRequest: (request: AppointmentRequest) => void; bookedSlots?: { therapist: string; date: string; time: string }[] }) {
  const [search, setSearch]       = useState("");
  const [avail, setAvail]         = useState("todos");
  const [spec, setSpec]           = useState("Todas");
  const [favs, setFavs]           = useState<number[]>([]);
  const [profile, setProfile]     = useState<typeof therapists[0] | null>(null);
  const [booking, setBooking]     = useState<typeof therapists[0] | null>(null);
  const [bookStep, setBookStep]   = useState(0);
  const [selDate, setSelDate]     = useState("");
  const [selTime, setSelTime]     = useState("");
  const [selModality, setSelModality] = useState<"virtual"|"presencial"|null>(null);
  const [toast, setToast]         = useState("");

  const toggleFav = (id: number) =>
    setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const filtered = therapists.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase());
    const matchAvail  = avail === "todos" || t.available;
    const matchSpec   = spec === "Todas" || t.specialty.includes(spec) || t.tags.some(tag => tag.includes(spec));
    return matchSearch && matchAvail && matchSpec;
  });

  const bookSlots = ["09:00", "10:00", "10:30", "11:00", "14:00", "15:30", "16:00", "17:00"];
  const _BOOK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const _BOOK_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const _now = new Date();
  const bookDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(_now);
    d.setDate(_now.getDate() + i);
    return {
      label: `${_BOOK_DAYS[d.getDay()]} ${d.getDate()} ${_BOOK_MONTHS[d.getMonth()]}`,
      isToday: i === 0,
    };
  });
  const selDateIsToday = bookDates.find(d => d.label === selDate)?.isToday ?? false;
  const isTimePast = (slot: string) => {
    if (!selDateIsToday) return false;
    const [h, m] = slot.split(":").map(Number);
    const slotMins = h * 60 + m;
    const nowMins = _now.getHours() * 60 + _now.getMinutes() + 60;
    return slotMins <= nowMins;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Terapeutas</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Encontrá al especialista ideal para tu hijo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input placeholder="Buscar por nombre o especialidad…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 font-medium" />
        </div>
        <select value={spec} onChange={e => setSpec(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none font-bold text-[#1C1135] cursor-pointer">
          <option value="Todas">Especialidad</option>
          {SPECIALTIES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
<select value={avail} onChange={e => setAvail(e.target.value)}
          className="px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm bg-white focus:outline-none font-bold text-[#1C1135] cursor-pointer">
          <option value="todos">Disponibilidad</option>
          <option value="disponibles">Disponibles ahora</option>
        </select>
      </div>

      {/* Favorites strip */}
      {favs.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3 flex-wrap" style={{ background: B.violetLight }}>
          <Heart size={14} style={{ color: B.violet }} className="flex-shrink-0" />
          <span className="text-sm font-extrabold text-[#1C1135]">Favoritos:</span>
          {therapists.filter(t => favs.includes(t.id)).map(t => (
            <span key={t.id} className="text-xs font-bold px-3 py-1 bg-white rounded-full border border-[#E8E5F4]">{t.name}</span>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-extrabold text-[#1C1135] mb-1">Sin resultados</p>
          <p className="text-sm text-[#7C6F9A] font-medium">Prueba con otros filtros</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(t => (
          <Crd key={t.id} className="p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <Av initials={t.av} color={t.color} size="lg" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${t.available ? "bg-emerald-400" : "bg-slate-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1C1135] truncate">{t.name}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{t.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-[#1C1135]">{t.rating}</span>
                  <span className="text-xs text-[#9E95B7]">({t.reviews})</span>
                </div>
              </div>
              {/* Favorite */}
              <button onClick={() => toggleFav(t.id)} className="p-1.5 rounded-xl hover:bg-[#F5F3FF] transition-colors flex-shrink-0">
                <Heart size={16} className={favs.includes(t.id) ? "fill-red-400 text-red-400" : "text-[#C4BED8]"} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {t.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
              <Bdg color="gray">{t.experience}</Bdg>
            </div>
            <div className="mb-4 text-center">
              <div className="rounded-xl py-2" style={{ background: B.bg }}>
                <p className="text-xs text-[#9E95B7] font-bold">Idiomas</p>
                <p className="font-bold text-[#1C1135] text-xs">ES · EN</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" className="flex-1 justify-center" onClick={() => setProfile(t)}>
                Ver perfil
              </Btn>
              <Btn size="sm" variant={t.available ? "primary" : "outline"} className="flex-1 justify-center"
                disabled={!t.available} onClick={() => { setBooking(t); setBookStep(0); setSelDate(""); setSelTime(""); }}>
                {t.available ? "Agendar" : "No disp."}
              </Btn>
            </div>
          </Crd>
        ))}
      </div>

      {/* Profile modal */}
      {profile && (
        <Modal title="Perfil del terapeuta" onClose={() => setProfile(null)} wide>
          <div className="p-6">
            <div className="flex items-start gap-5 mb-6">
              <Av initials={profile.av} color={profile.color} size="xl" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-2xl text-[#1C1135]">{profile.name}</h3>
                    <p className="text-sm text-[#7C6F9A] font-medium">{profile.specialty}</p>
                  </div>
                  <button onClick={() => toggleFav(profile.id)} className="p-2 rounded-xl hover:bg-[#F5F3FF] transition-colors">
                    <Heart size={20} className={favs.includes(profile.id) ? "fill-red-400 text-red-400" : "text-[#C4BED8]"} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-black text-[#1C1135]">{profile.rating}</span>
                  <span className="text-sm text-[#9E95B7]">({profile.reviews} reseñas)</span>
                  <Bdg color={profile.available ? "green" : "gray"}>{profile.available ? "Disponible" : "No disponible"}</Bdg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Experiencia", value: profile.experience },
                { label: "Modalidad", value: "Virtual por ASHA Session" },
                { label: "Idiomas", value: "Español · Inglés" },
              ].map(f => (
                <div key={f.label} className="rounded-2xl p-3" style={{ background: B.bg }}>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{f.label}</p>
                  <p className="font-bold text-[#1C1135] text-sm mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mb-5">
              <p className="font-extrabold text-[#1C1135] mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
              </div>
            </div>
            <div className="mb-6 p-4 rounded-2xl" style={{ background: B.violetLight }}>
              <p className="text-sm font-medium text-[#1C1135] leading-relaxed">
                "Especialista en terapia infantil con enfoque lúdico y familiar. Trabajo con niños desde los 3 años usando metodologías basadas en evidencia, adaptando cada sesión al ritmo y necesidades del niño."
              </p>
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => { setProfile(null); }}>
                <Share2 size={14} /> Compartir
              </Btn>
              <Btn variant="primary" className="flex-1 justify-center" onClick={() => { setProfile(null); setBooking(profile); setBookStep(0); setSelDate(""); setSelTime(""); }}>
                <Calendar size={14} /> Agendar sesión
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Booking modal */}
      {booking && (
        <Modal title={bookStep === 3 ? "¡Solicitud enviada!" : `Solicitar cita con ${booking.name}`} onClose={() => setBooking(null)} wide>
          {/* Step indicator */}
          {bookStep < 3 && (
            <div className="px-6 pt-5 pb-0">
              <div className="flex items-center gap-1.5 mb-1">
                {["Fecha y hora","Modalidad","Confirmar"].map((s,i)=>(
                  <div key={s} className="flex items-center gap-1.5 flex-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0" style={{background:i<=bookStep?B.violet:"#E8E5F4",color:i<=bookStep?"white":B.textMuted}}>
                      {i<bookStep?<Check size={9}/>:i+1}
                    </div>
                    <span className="text-[10px] font-bold hidden sm:block" style={{color:i<=bookStep?B.violet:B.textMuted}}>{s}</span>
                    {i<2&&<div className="flex-1 h-px" style={{background:i<bookStep?B.violet:"#E8E5F4"}}/>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {bookStep === 0 && (
            <div className="p-6">
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Selecciona una fecha</p>
              <div className="grid grid-cols-5 gap-2 mb-6 max-h-48 overflow-y-auto pr-0.5">
                {bookDates.map(({ label, isToday }) => {
                  const active = selDate === label;
                  return (
                    <button key={label} onClick={() => { setSelDate(label); setSelTime(""); }}
                      className="rounded-2xl py-3 text-center text-xs font-bold border-2 transition-all"
                      style={{ borderColor: active ? B.violet : B.border, background: active ? B.violetLight : isToday ? "#FAFAF9" : "white", color: active ? B.violet : B.textMid }}>
                      {label.split(" ").map((part, i) => <div key={i} className={i === 0 ? "text-[10px] opacity-70" : ""}>{part}</div>)}
                      {isToday && <div className="text-[9px] font-extrabold mt-0.5" style={{ color: active ? B.violet : B.teal }}>Hoy</div>}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm font-extrabold text-[#1C1135] mb-3">Selecciona un horario</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {bookSlots.map(s => {
                  const dateKey = selDate ? (() => { const [, d, m] = selDate.split(" "); return `${d} ${m} 2026`; })() : "";
                  const taken = selDate ? bookedSlots.some(b => b.therapist === booking!.name && b.date === dateKey && b.time === s) : false;
                  const past = isTimePast(s);
                  const disabled = taken || past;
                  return (
                    <button key={s} onClick={() => !disabled && setSelTime(s)} disabled={disabled}
                      title={past ? "Horario ya pasado" : taken ? "Horario no disponible" : undefined}
                      className="rounded-xl py-2.5 text-xs font-bold border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through"
                      style={{ borderColor: disabled ? B.border : selTime === s ? B.teal : B.border, background: disabled ? "#F9FAFB" : selTime === s ? B.tealLight : "white", color: disabled ? "#9CA3AF" : selTime === s ? B.teal : B.textMid }}>
                      {s}
                    </button>
                  );
                })}
              </div>
              <Btn variant="primary" className="w-full justify-center" disabled={!selDate || !selTime}
                onClick={() => setBookStep(1)}>
                Continuar <ArrowRight size={15} />
              </Btn>
            </div>
          )}
          {bookStep === 1 && (
            <div className="p-6">
              <p className="text-sm font-extrabold text-[#1C1135] mb-4">¿Cómo quieres realizar la sesión?</p>
              <div className="flex flex-col gap-3 mb-6">
                <button onClick={() => setSelModality("virtual")}
                  className="flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                  style={{ borderColor: selModality === "virtual" ? B.violet : B.border, background: selModality === "virtual" ? B.violetLight : "white" }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: selModality === "virtual" ? B.violet : "#F5F3FF" }}>
                    <span style={{ filter: selModality === "virtual" ? "brightness(10)" : "none" }}>💻</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[#1C1135] mb-0.5">Virtual</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">Sesión por videollamada a través de ASHA Session. Conéctate desde casa.</p>
                  </div>
                  {selModality === "virtual" && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: B.violet }}><Check size={10} color="white" /></div>}
                </button>
                <button onClick={() => setSelModality("presencial")}
                  className="flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                  style={{ borderColor: selModality === "presencial" ? B.teal : B.border, background: selModality === "presencial" ? B.tealLight : "white" }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: selModality === "presencial" ? B.teal : "#F0FDFA" }}>
                    <span style={{ filter: selModality === "presencial" ? "brightness(10)" : "none" }}>🏥</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[#1C1135] mb-0.5">Presencial</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">Asiste al centro de terapia. Sesión en consultorio con la terapeuta.</p>
                  </div>
                  {selModality === "presencial" && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: B.teal }}><Check size={10} color="white" /></div>}
                </button>
              </div>
              {selModality === "presencial" && (
                <div className="rounded-2xl p-4 mb-5 border border-teal-100" style={{ background: "#F0FDFA" }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[#1C1135] text-sm mb-0.5">Integrakids Perú</p>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-2">Centro de terapia sensorial · terapia ocupacional · terapia de lenguaje · terapia psicológica para niños</p>
                      <p className="text-xs font-bold text-[#1C1135] mb-3">Jr. Ricardo Treneman 252, Chorrillos 15064</p>
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
                <Btn variant="outline" className="flex-1 justify-center" onClick={() => setBookStep(0)}>
                  <ChevronLeft size={14} /> Atrás
                </Btn>
                <Btn variant="primary" className="flex-1 justify-center" disabled={!selModality} onClick={() => setBookStep(2)}>
                  Continuar <ArrowRight size={15} />
                </Btn>
              </div>
            </div>
          )}
          {bookStep === 2 && (
            <div className="p-6">
              <div className="rounded-2xl p-5 border border-[#E8E5F4] mb-5">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Resumen de la cita</p>
                {[
                  { label: "Terapeuta", value: booking.name },
                  { label: "Especialidad", value: booking.specialty },
                  { label: "Fecha", value: selDate },
                  { label: "Hora", value: selTime },
                  { label: "Duración", value: "45 minutos" },
                  { label: "Modalidad", value: selModality === "presencial" ? "Presencial" : "Virtual (ASHA Session)" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-[#F5F3FF] last:border-0">
                    <span className="text-sm font-bold text-[#9E95B7]">{r.label}</span>
                    <span className="text-sm font-extrabold text-[#1C1135]">{r.value}</span>
                  </div>
                ))}
              </div>
              {selModality === "presencial" && (
                <div className="rounded-2xl p-4 mb-5 border border-teal-100 flex items-start gap-3" style={{ background: "#F0FDFA" }}>
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-sm font-extrabold text-[#1C1135] mb-0.5">Integrakids Perú</p>
                    <p className="text-xs text-[#7C6F9A] font-medium mb-2">Jr. Ricardo Treneman 252, Chorrillos 15064</p>
                    <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer"
                      className="text-xs font-extrabold hover:underline" style={{ color: B.teal }}>Ver en Google Maps →</a>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Btn variant="outline" className="flex-1 justify-center" onClick={() => setBookStep(1)}>
                  <ChevronLeft size={14} /> Atrás
                </Btn>
                <Btn variant="cta" className="flex-1 justify-center" onClick={() => {
                  const [, day, month] = selDate.split(" ");
                  onRequest({
                    id: Date.now(), therapist: booking.name, specialty: booking.specialty,
                    child: "Mateo", parent: "Laura Gómez",
                    date: `${day} ${month} 2026`, time: selTime, type: selModality ?? "virtual", status: "por confirmar",
                  });
                  setBookStep(3);
                }}>
                  <Check size={14} /> Enviar solicitud
                </Btn>
              </div>
            </div>
          )}
          {bookStep === 3 && (
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4" style={{ background: B.successLight }}>🎉</div>
              <h3 className="font-black text-xl text-[#1C1135] mb-2">¡Solicitud enviada!</h3>
              <p className="text-sm text-[#7C6F9A] font-medium mb-2">{booking.name} revisará tu solicitud para el <strong>{selDate}</strong> a las <strong>{selTime}</strong>.</p>
              {selModality === "presencial" && (
                <p className="text-xs text-teal-700 font-bold mb-3 p-2 rounded-xl" style={{ background: "#F0FDFA" }}>📍 Sesión presencial · Jr. Ricardo Treneman 252, Chorrillos</p>
              )}
              <p className="text-xs text-[#9E95B7] font-medium mb-6">Cuando la terapeuta la acepte, te avisaremos por aquí.</p>
              <div className="flex gap-3">
                <Btn variant="outline" className="flex-1 justify-center" onClick={() => { setBooking(null); setToast("Solicitud enviada. Te avisaremos cuando sea aceptada."); }}>
                  Cerrar
                </Btn>
                <Btn variant="primary" className="flex-1 justify-center" onClick={() => { setBooking(null); setToast("Solicitud enviada. Te avisaremos cuando sea aceptada."); go("padre/agenda"); }}>
                  <Calendar size={14} /> Ver en agenda
                </Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── 2. Agenda ────────────────────────────────────────────────────────────────

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_LABEL = ["L","M","X","J","V","S","D"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

type Apt = AppointmentRequest;

export function PadreAgenda({ go, appointments: apts, onAppointmentsChange }: { go: (v: View) => void; appointments: Apt[]; onAppointmentsChange: React.Dispatch<React.SetStateAction<Apt[]>> }) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selDay, setSelDay] = useState<number | null>(today.getDate());
  const setApts = onAppointmentsChange;
  const [showNew, setShowNew] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [toast, setToast]   = useState("");
  const [timelineSel, setTimelineSel] = useState<Apt | null>(null);
  const [expandedReservationIds, setExpandedReservationIds] = useState<number[]>([]);

  // New appointment form
  const [newStep, setNewStep] = useState(0);
  const [newTherapist, setNewTherapist] = useState("");
  const [newDay, setNewDay]   = useState<number | null>(null);
  const [newTime, setNewTime] = useState("");
  const [newChild, setNewChild] = useState("Mateo");
  const [newModality, setNewModality] = useState<"virtual"|"presencial"|null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfWeek(year, month);
  const SHORT_MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const aptDays = new Set(
    apts
      .filter(a => { const p = a.date.split(" "); return p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; })
      .map(a => parseInt(a.date.split(" ")[0]))
  );

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelDay(null); setTimelineSel(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelDay(null); setTimelineSel(null);
  };

  const selectedApts = selDay
    ? apts.filter(a => { const p = a.date.split(" "); return parseInt(p[0]) === selDay && p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; })
    : apts.filter(a => { const p = a.date.split(" "); return p[1] === SHORT_MONTHS[month] && parseInt(p[2]) === year; });
  const pendingCount = apts.filter(apt => apt.status === "por confirmar").length;
  const confirmedApts = selectedApts.filter((apt) => apt.status === "confirmada");
  const waitingApts = selectedApts.filter((apt) => apt.status === "por confirmar");
  const rejectedApts = selectedApts.filter((apt) => apt.status === "rechazada");

  const cancelApt = (id: number) => {
    setApts(prev => prev.filter(a => a.id !== id));
    setCancelId(null);
    setToast("Cita cancelada correctamente");
  };

  const confirmNew = () => {
    const newApt: Apt = {
      id: Date.now(),
      therapist: newTherapist,
      specialty: therapists.find(t => t.name === newTherapist)?.specialty ?? "Terapia",
      child: newChild,
      date: `${newDay} ${MONTHS[month].slice(0,3)} ${year}`,
      time: newTime,
      type: newModality ?? "virtual",
      status: "por confirmar",
    };
    setApts(prev => [...prev, newApt]);
    setShowNew(false);
    setNewStep(0);
    setNewTherapist("");
    setNewDay(null);
    setNewTime("");
    setNewModality(null);
    setToast("Solicitud enviada. Te avisaremos cuando sea aceptada.");
  };

  const bookSlots = ["08:00","09:00","10:00","10:30","11:00","12:00","14:00","15:00","15:30","16:00","17:00"];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
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
    </div>
  );
}

// ─── 3. Mensajes ──────────────────────────────────────────────────────────────

type Msg = { id: number; from: string; text: string; time: string; own: boolean; av: string; color: string; };

const CONVERSATIONS = [
  { id: 1, sessionId: "ASH-2026-081", name: "Dra. Ana Ruiz", av: "AR", color: B.violet, online: true, unread: 2, last: "Perfecto, nos vemos el martes", child: "Mateo", session: "Sesión del 6 Ago · 10:00", sessionStatus: "confirmada", canMessage: true },
  { id: 2, sessionId: "ASH-2026-067", name: "Lic. C. Mendoza", av: "CM", color: "#2563EB", online: false, unread: 0, last: "El reporte está listo para revisar", child: "Mateo", session: "Sesión finalizada · 22 Jul", sessionStatus: "seguimiento", canMessage: true },
  { id: 3, sessionId: "ASH-2026-085", name: "Lic. Patricia V.", av: "PV", color: B.teal, online: false, unread: 1, last: "¿Cómo le fue a Sofía esta semana?", child: "Sofía", session: "Sesión del 8 Ago · 15:30", sessionStatus: "confirmada", canMessage: true },
];

const CHAT_HISTORY: Record<number, Msg[]> = {
  1: msgs as Msg[],
  2: [
    { id: 1, from: "Lic. C. Mendoza", text: "Buenos días, el reporte de Mateo del mes de junio ya está disponible.", time: "Lun 9:00", own: false, av: "CM", color: "#2563EB" },
    { id: 2, from: "Yo", text: "Muchas gracias, lo revisaré hoy mismo.", time: "Lun 9:15", own: true, av: "LG", color: B.violet },
    { id: 3, from: "Lic. C. Mendoza", text: "El reporte está listo para revisar.", time: "Lun 9:16", own: false, av: "CM", color: "#2563EB" },
  ],
  3: [
    { id: 1, from: "Lic. Patricia V.", text: "Hola Sergio, ¿cómo le fue a Sofía esta semana con los ejercicios en casa?", time: "Mar 11:00", own: false, av: "PV", color: B.teal },
    { id: 2, from: "Yo", text: "¡Muy bien! Estuvo practicando todos los días. Le encantó el cuento de los animales.", time: "Mar 11:30", own: true, av: "LG", color: B.violet },
  ],
};

export function PadreMensajes() {
  const [activeCon, setActiveCon] = useState(1);
  const [searchChat, setSearchChat] = useState("");
  const [chats, setChats]         = useState(CHAT_HISTORY);
  const [input, setInput]         = useState("");
  const [status, setStatus]       = useState<Record<number,number>>({ 1: 2, 2: 0, 3: 1 });
  const [calling, setCalling]     = useState<"phone" | "video" | null>(null);
  const [attach, setAttach]       = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const sessionChats = CONVERSATIONS.filter(conversation => conversation.canMessage);
  const visibleChats = sessionChats.filter(conversation => `${conversation.name} ${conversation.child}`.toLowerCase().includes(searchChat.toLowerCase()));
  const curCon = sessionChats.find(c => c.id === activeCon) ?? sessionChats[0];
  const curMsgs = chats[curCon.id] ?? [];

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [curMsgs]);

  const sendMsg = () => {
    const txt = input.trim();
    if (!txt || !curCon.canMessage) return;
    const newMsg: Msg = {
      id: Date.now(), from: "Yo", text: txt,
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      own: true, av: "LG", color: B.violet,
    };
    setChats(c => ({ ...c, [curCon.id]: [...(c[curCon.id] ?? []), newMsg] }));
    setInput("");
    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Entendido, gracias por avisarme.",
        "Perfecto, lo tendré en cuenta para la próxima sesión.",
        "¡Excelente progreso! Sigue así.",
        "Anotado, hablamos en la sesión del martes.",
        "Gracias por el mensaje. Nos vemos pronto.",
      ];
      const reply: Msg = {
        id: Date.now() + 1, from: curCon.name,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        own: false, av: curCon.av, color: curCon.color,
      };
      setChats(c => ({ ...c, [curCon.id]: [...(c[curCon.id] ?? []), reply] }));
    }, 1500);
  };

  const selectCon = (id: number) => {
    setActiveCon(id);
    setStatus(s => ({ ...s, [id]: 0 }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col" style={{ fontFamily: '"Nunito", system-ui, sans-serif', height: "calc(100vh - 4rem)" }}>
      {calling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center max-w-xs w-full shadow-2xl">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4" style={{ background: B.tealLight }}>
              {calling === "phone" ? "📞" : "📹"}
            </div>
            <p className="font-extrabold text-[#1C1135] text-lg mb-1">{curCon.name}</p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-2">Llamando…</p>
            <div className="flex justify-center gap-1 mb-6">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
            <button onClick={() => setCalling(null)}
              className="w-full py-3 rounded-2xl font-extrabold text-white bg-red-500 hover:bg-red-600 transition-colors">
              Colgar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Mensajes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Cada chat está vinculado a una sesión confirmada o en seguimiento</p>
        </div>
      </div>

      <Crd className="flex overflow-hidden flex-1 min-h-0">
        {/* Conversations sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-[#F5F3FF] flex flex-col overflow-hidden hidden sm:flex">
          <div className="p-3 border-b border-[#F5F3FF]">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
              <input placeholder="Buscar por terapeuta o hijo…" value={searchChat} onChange={e => setSearchChat(e.target.value)} className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8E5F4] text-xs font-medium focus:outline-none focus:border-violet-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2.5 bg-violet-50 border-b border-violet-100"><p className="text-[10px] font-black uppercase tracking-wider text-violet-600">Chats por sesión</p></div>
            {visibleChats.length === 0 && <div className="p-5 text-center text-xs font-medium text-[#9E95B7]">Los chats se habilitan al confirmar una cita.</div>}
            {visibleChats.map(c => (
              <button key={c.id} onClick={() => selectCon(c.id)}
                className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors border-b border-[#FAFAF9] last:border-0 ${activeCon === c.id ? "bg-violet-50" : "hover:bg-[#FAFAF9]"}`}>
                <div className="relative flex-shrink-0">
                  <Av initials={c.av} color={c.color} size="sm" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${c.online ? "bg-emerald-400" : "bg-slate-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-extrabold text-[#1C1135] truncate">{c.name}</p>
                    {status[c.id] > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: B.violet }}>
                        {status[c.id]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-violet-500 truncate">{c.child} · {c.sessionStatus}</p>
                  <p className="text-xs text-[#9E95B7] truncate">{c.last}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#F5F3FF] flex-shrink-0">
            <Av initials={curCon.av} color={curCon.color} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[#1C1135] text-sm">{curCon.name}</p>
              <p className="text-xs font-bold text-violet-600">{curCon.child} · {curCon.session}</p>
              <p className={`text-[11px] flex items-center gap-1 font-bold ${curCon.online ? "text-emerald-500" : "text-[#9E95B7]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${curCon.online ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
                {curCon.online ? "En línea" : "Última vez: hace 2h"}
              </p>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => setCalling("phone")}><Phone size={14} /></Btn>
            <Btn size="sm" variant="ghost" onClick={() => setCalling("video")}><Video size={14} /></Btn>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {curMsgs.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
                {!msg.own && <Av initials={msg.av} color={msg.color} size="sm" />}
                <div className={`max-w-[75%] flex flex-col gap-1 ${msg.own ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium ${msg.own ? "text-white rounded-tr-sm" : "text-[#1C1135] rounded-tl-sm"}`}
                    style={{ background: msg.own ? B.violet : B.violetLight }}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-[#9E95B7] font-medium">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {attach && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#C4B5FD] bg-violet-50">
                <FileText size={14} style={{ color: B.violet }} />
                <span className="text-xs font-bold text-[#7C6F9A]">Adjuntar archivo</span>
                <div className="flex gap-1.5 ml-2">
                  {["📄 Documento", "🖼️ Imagen", "📊 Reporte"].map(t => (
                    <button key={t} onClick={() => setAttach(false)}
                      className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-[#E8E5F4] hover:border-violet-300 transition-colors">{t}</button>
                  ))}
                </div>
                <button onClick={() => setAttach(false)} className="ml-auto text-[#9E95B7]"><X size={12} /></button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-[#F5F3FF] flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setAttach(a => !a)} className="p-2 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors flex-shrink-0">
              <Paperclip size={17} />
            </button>
            <input type="text" placeholder="Escribe un mensaje…" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg()}
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm border border-[#E8E5F4] focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 font-medium"
              style={{ background: B.violetLight }} />
            <button onClick={sendMsg} disabled={!input.trim()}
              className="p-2.5 rounded-xl text-white transition-all active:scale-[.97] disabled:opacity-40 flex-shrink-0"
              style={{ background: B.violet }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </Crd>
    </div>
  );
}

// ─── 4. Compras & Facturación ─────────────────────────────────────────────────

type Purchase = { id: number; date: string; pkg: string; therapist: string; amount: string; hours: number; status: "completado" | "pendiente"; };

const PURCHASES: Purchase[] = [
  { id: 1, date: "15 Jul 2026", pkg: "6 horas",  therapist: "Dra. Ana Ruiz",   amount: "—", hours: 6,  status: "completado" },
  { id: 2, date: "02 Jun 2026", pkg: "2 horas",  therapist: "Lic. C. Mendoza", amount: "—", hours: 2,  status: "completado" },
  { id: 3, date: "18 May 2026", pkg: "10 horas", therapist: "Dra. Ana Ruiz",   amount: "—", hours: 10, status: "completado" },
];

export function PadreCompras({ go, appointments, onAppointmentsChange }: { go: (v: View) => void; appointments: Apt[]; onAppointmentsChange: React.Dispatch<React.SetStateAction<Apt[]>> }) {
  const [toast, setToast]       = useState("");
  const [receipt, setReceipt]   = useState<Purchase | null>(null);
  const [cart, setCart]         = useState<number | null>(null);
  const [coupon, setCoupon]     = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [openPayments, setOpenPayments] = useState<number[]>([]);
  const confirmedSessions = appointments.filter(apt => apt.status === "confirmada");
  const pendingPayments = confirmedSessions.filter(apt => apt.paymentStatus !== "pagada");
  const paidSessions = confirmedSessions.filter(apt => apt.paymentStatus === "pagada");

  const pkgs = [
    { id: 1, hours: 2,  price: "—", label: "Paquete Inicial",  popular: false, bg: B.violetLight, border: "#C4B5FD", discount: null },
    { id: 2, hours: 6,  price: "—", label: "Paquete Familiar", popular: true,  bg: "#EDE9FE",     border: B.violet,  discount: null },
    { id: 3, hours: 10, price: "—", label: "Paquete Completo", popular: false, bg: B.tealLight,   border: "#99F6E4", discount: null },
  ];

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ASHA20") { setCouponApplied(true); setToast("Cupón ASHA20 aplicado: 20% de descuento"); }
    else setToast("Cupón no válido. Prueba con ASHA20");
  };

  const exportHistory = () => {
    setToast("Historial exportado como CSV");
  };

  const downloadPDF = (p: Purchase) => {
    setReceipt(p);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      {/* Receipt modal */}
      {receipt && (
        <Modal title="Comprobante de pago" onClose={() => setReceipt(null)}>
          <div className="p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: B.successLight }}>✅</div>
              <p className="font-black text-[#1C1135] text-lg">Pago confirmado</p>
              <p className="text-xs text-[#9E95B7] font-medium">Ref: ASHA-{receipt.id.toString().padStart(6,"0")}</p>
            </div>
            <div className="rounded-2xl border border-[#E8E5F4] overflow-hidden mb-5">
              {[
                { l: "Fecha", v: receipt.date },
                { l: "Paquete", v: receipt.pkg },
                { l: "Terapeuta", v: receipt.therapist },
                { l: "Total pagado", v: receipt.amount },
                { l: "Método de pago", v: "Plataforma" },
                { l: "Estado", v: "Completado" },
              ].map(r => (
                <div key={r.l} className="flex justify-between px-4 py-3 border-b border-[#F5F3FF] last:border-0">
                  <span className="text-sm font-bold text-[#9E95B7]">{r.l}</span>
                  <span className="text-sm font-extrabold text-[#1C1135]">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => { setReceipt(null); setToast("PDF descargado"); }}>
                <Download size={14} /> Descargar PDF
              </Btn>
              <Btn variant="ghost" className="flex-1 justify-center" onClick={() => { setReceipt(null); setToast("Comprobante compartido"); }}>
                <Share2 size={14} /> Compartir
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Cart / checkout modal */}
      {cart !== null && (
        <Modal title="Finalizar compra" onClose={() => setCart(null)}>
          <div className="p-6">
            {(() => {
              const pkg = pkgs.find(p => p.id === cart)!;
              const finalPrice = "—";
              return (
                <>
                  <div className="rounded-2xl p-4 border border-[#E8E5F4] mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-extrabold text-[#1C1135]">{pkg.label}</p>
                      <Bdg color="violet">{pkg.hours}h</Bdg>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#7C6F9A] font-medium">Subtotal</span>
                        <span className="font-bold">—</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-[#1C1135] border-t border-[#E8E5F4] pt-2">
                        <span>Total</span>
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <p className="text-sm font-extrabold text-[#1C1135] mb-3">Método de pago</p>
                    {[
                      { icon: "💳", label: "Pago por plataforma", sub: "Recomendado" },
                      { icon: "💰", label: "Tarjeta de crédito/débito", sub: "Visa · Mastercard" },
                    ].map((m, i) => (
                      <button key={i} className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 mb-2 text-left transition-all"
                        style={{ borderColor: i === 0 ? B.violet : B.border, background: i === 0 ? B.violetLight : "white" }}>
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <p className="font-extrabold text-sm text-[#1C1135]">{m.label}</p>
                          <p className="text-xs text-[#9E95B7] font-medium">{m.sub}</p>
                        </div>
                        {i === 0 && <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: B.violet }}><Check size={10} color="white" /></div>}
                      </button>
                    ))}
                  </div>
                  <Btn variant="cta" className="w-full justify-center" onClick={() => { setCart(null); setToast(`¡${pkg.label} adquirido exitosamente!`); go("pay"); }}>
                    <CreditCard size={14} /> Confirmar pago
                  </Btn>
                </>
              );
            })()}
          </div>
        </Modal>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Compras & Facturación</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Adquirí paquetes de horas para las terapias de tus hijos</p>
      </div>

      <Crd className="mb-7 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F3FF]"><h3 className="font-extrabold text-[#1C1135]">Detalle de la reserva</h3><p className="text-xs text-[#7C6F9A] font-medium mt-1">Datos simulados · Solo aparecen sesiones confirmadas.</p></div>
        <div className="p-4 sm:p-5 space-y-3">
          {pendingPayments.length === 0 ? (
            <div className="py-8 text-center"><p className="text-3xl mb-2">✓</p><p className="font-extrabold text-[#1C1135]">No tienes sesiones pendientes de pago</p></div>
          ) : pendingPayments.map((apt, index) => {
            const open = openPayments.includes(apt.id);
            const contentId = `payment-detail-${apt.id}`;
            return (
              <article key={apt.id} className="w-full min-h-[76px] rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden transition-shadow hover:shadow-sm">
                <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpenPayments((current) => current.includes(apt.id) ? current.filter((id) => id !== apt.id) : [...current, apt.id])} className="w-full min-h-[76px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F8F6FF] focus-visible:ring-2 focus-visible:ring-violet-500">
                  <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: B.violetLight }}><Calendar size={17} className="text-violet-600" /></div>
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-sm text-[#1C1135]">Sesión reservada {String(index + 1).padStart(2, "0")}</p></div>
                  <span className="text-xs font-bold text-emerald-600">Confirmada</span><ChevronRight size={17} className={`shrink-0 text-[#7C6F9A] transition-transform ${open ? "rotate-90" : ""}`} />
                </button>
                {open && <div id={contentId} className="px-4 pb-4 pt-3 border-t border-[#F5F3FF] text-sm text-[#7C6F9A] font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 py-1"><p><span className="font-bold text-[#1C1135]">Terapeuta:</span> {apt.therapist}</p><p><span className="font-bold text-[#1C1135]">Niño:</span> {apt.child}</p><p><span className="font-bold text-[#1C1135]">Fecha:</span> {apt.date}</p><p><span className="font-bold text-[#1C1135]">Hora y duración:</span> {apt.time} · 45 min</p><p><span className="font-bold text-[#1C1135]">Modalidad:</span> {apt.type === "presencial" ? "Presencial" : "Virtual"}</p><p><span className="font-bold text-[#1C1135]">Referencia:</span> ASHA-{String(apt.id).slice(-6)}</p><p><span className="font-bold text-[#1C1135]">Confirmación:</span> Confirmada por terapeuta</p></div>
                  {apt.type === "presencial" && <div className="mt-2 rounded-xl p-2.5 flex items-center gap-2 border border-teal-100 text-xs" style={{background:"#F0FDFA"}}><span>📍</span><span className="font-medium text-[#0D9488]">Jr. Ricardo Treneman 252, Chorrillos 15064 · <a href="https://maps.google.com/?q=Jr.+Ricardo+Treneman+252,+Chorrillos+15064" target="_blank" rel="noopener noreferrer" className="underline">Ver mapa</a></span></div>}
                  <div className="mt-4 flex justify-end"><Btn size="sm" variant="cta" onClick={() => { onAppointmentsChange((current) => current.map((item) => item.id === apt.id ? { ...item, paymentStatus: "pagada" } : item)); setToast("Pago simulado registrado."); }}><CreditCard size={13} /> Pagar</Btn></div>
                </div>}
              </article>
            );
          })}
        </div>
        {paidSessions.length > 0 && <div className="px-5 py-4 border-t border-[#F5F3FF]"><p className="text-xs font-extrabold uppercase tracking-wider text-[#9E95B7] mb-2">Pagadas</p>{paidSessions.map(apt => <div key={apt.id} className="text-sm flex justify-between gap-3 py-1.5 text-[#7C6F9A]"><span>{apt.date} · {apt.therapist}</span><span className="font-bold text-emerald-600">Pagada</span></div>)}</div>}
      </Crd>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {pkgs.map(pkg => (
          <div key={pkg.id} className="rounded-3xl p-7 border-2 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: pkg.bg, borderColor: pkg.popular ? B.violet : pkg.border }}
            onClick={() => setCart(pkg.id)}>
            {pkg.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap" style={{ background: B.violet }}>
                Más popular
              </div>
            )}
            {pkg.discount && (
              <div className="absolute top-4 right-4 text-xs font-black px-2.5 py-1 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>
                {pkg.discount}
              </div>
            )}
            <p className="font-extrabold text-[#1C1135] mb-1">{pkg.label}</p>
            <p className="text-4xl font-black text-[#1C1135] mb-0.5">{pkg.price}</p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-5">{pkg.hours} horas de terapia</p>
            <ul className="text-sm text-[#7C6F9A] flex flex-col gap-2.5 mb-6 font-medium">
              {["Válido por 6 meses", "Factura PDF incluida", "Cualquier terapeuta"].map(f => (
                <li key={f} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Btn variant={pkg.popular ? "cta" : "outline"} className="w-full justify-center" onClick={e => { e.stopPropagation(); setCart(pkg.id); }}>
              <CreditCard size={14} /> Seleccionar paquete
            </Btn>
          </div>
        ))}
      </div>

      <Crd>
        <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-extrabold text-[#1C1135]">Historial de compras</h3>
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" onClick={exportHistory}><Download size={13} /> Exportar CSV</Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F5F3FF]">
                {["Fecha", "Paquete", "Terapeuta", "Monto", "Estado", ""].map(h => (
                  <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PURCHASES.map(row => (
                <tr key={row.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{row.date}</td>
                  <td className="px-5 py-3.5 text-sm font-extrabold text-[#1C1135]">{row.pkg}</td>
                  <td className="px-5 py-3.5 text-sm text-[#7C6F9A] font-medium">{row.therapist}</td>
                  <td className="px-5 py-3.5 text-sm font-black text-[#1C1135]">{row.amount}</td>
                  <td className="px-5 py-3.5"><Bdg color="green">{row.status}</Bdg></td>
                  <td className="px-5 py-3.5">
                    <Btn size="sm" variant="ghost" onClick={() => downloadPDF(row)}>
                      <Download size={12} /> PDF
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Crd>
    </div>
  );
}
