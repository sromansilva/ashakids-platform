import { useState } from "react";
import { Search, Star, Heart, ChevronLeft, Check, Calendar, ArrowRight, Share2, MapPin } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { therapists } from "@/mocks/demo";

// ─── Shared micro components ──────────────────────────────────────────────────
import { Toast } from "@/pages/padre/Padre/Toast";
import { Modal } from "@/pages/padre/Padre/Modal";
import { SPECIALTIES } from "@/pages/padre/Padre/SPECIALTIES";
import { AppointmentRequest } from "@/types/AppointmentRequest";

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
