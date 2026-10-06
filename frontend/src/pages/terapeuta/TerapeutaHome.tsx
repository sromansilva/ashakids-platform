import { useState } from "react";
import { Bell, Users, Calendar, FileText, MessageCircle, Star, Activity, Video } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av } from "@/components/shared";
import type { AppointmentRequest } from "@/pages/padre/Padre";

export function TerapeutaHome({ go }: { go: (v: View) => void }) {
  const pendingRequests: AppointmentRequest[] = [
    { id: 1, therapist: "Dra. Ana Ruiz", specialty: "Lenguaje", child: "Lucía Fernández", parent: "Carlos Fernández", date: "2026-07-31", time: "10:00", type: "virtual", status: "por confirmar" },
    { id: 2, therapist: "Dra. Ana Ruiz", specialty: "Lenguaje", child: "Diego Martínez",  parent: "Laura Martínez",   date: "2026-08-02", time: "14:00", type: "virtual", status: "por confirmar" },
  ];
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const filteredRequests = pendingRequests.filter((req: any) => {
    if (filterFrom && req.date < filterFrom) return false;
    if (filterTo && req.date > filterTo) return false;
    return true;
  });
  const todayApts = [
    { time: "09:00", patient: "Mateo Gómez",    dur: "45 min", status: "próxima",    av: "MG", color: B.violet  },
    { time: "11:30", patient: "Valentina López", dur: "60 min", status: "confirmada", av: "VL", color: B.teal    },
    { time: "15:00", patient: "Bruno Ríos",      dur: "45 min", status: "confirmada", av: "BR", color: "#22C55E" },
  ];
  const stats = [
    { icon: <Users size={18}/>,         val: "18",     label: "Pacientes",       color: B.violet,   bg: B.violetLight },
    { icon: <Calendar size={18}/>,      val: "3",      label: "Sesiones hoy",    color: B.teal,     bg: B.tealLight   },
    { icon: <FileText size={18}/>,      val: "5",      label: "Reportes pend.",  color: B.orange,   bg: B.orangeLight },
    { icon: <MessageCircle size={18}/>, val: "7",      label: "Mensajes nuevos", color: B.violet,   bg: B.violetLight },
    { icon: <Star size={18}/>,          val: "4.9",    label: "Calificación",    color: "#D97706",  bg: "#FEF3C7"     },
    { icon: <Activity size={18}/>,      val: "94 h",   label: "Horas totales",   color: B.teal,     bg: B.tealLight   },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Profile header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${B.teal}, #0F766E)` }}>AR</div>
          <div>
            <h2 className="text-xl font-black text-[#1C1135]">Dra. Ana Ruiz</h2>
            <p className="text-sm text-[#7C6F9A] font-medium">Terapeuta de lenguaje · Miércoles, 30 de julio 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: "#D1FAE5", color: "#059669" }}>
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            Disponible
          </div>
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(v => !v)}
              className="relative p-2 rounded-2xl hover:bg-violet-50 transition-colors border border-[#E8E5F4] bg-white"
            >
              <Bell size={20} style={{ color: B.violet }} />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: B.orange }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>
            {showNotifDropdown && pendingRequests.length > 0 && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E5F4] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8E5F4]">
                  <p className="text-sm font-extrabold text-[#1C1135]">Nuevas solicitudes de cita</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {pendingRequests.map((req: any) => (
                    <button
                      key={req.id}
                      onClick={() => { setShowNotifDropdown(false); go("terapeuta/agenda"); }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-violet-50 transition-colors text-left border-b border-[#F0EDF8] last:border-0"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: B.violet }}>
                        {req.child.split(" ").map((p: string) => p[0]).join("").slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1C1135] truncate">{req.child}</p>
                        <p className="text-xs text-[#7C6F9A]">{req.date} · {req.time}</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">Nueva</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={13} /> Iniciar sesión</Btn>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: s.bg }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white" style={{ color: s.color }}>{s.icon}</div>
            <p className="font-black text-lg text-[#1C1135] leading-none">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
          {/* Próxima sesión premium card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 0 3px rgba(74,222,128,0.3)" }} />
                <span className="text-violet-200 text-xs font-bold uppercase tracking-wider">Próxima sesión · en 28 min</span>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white text-lg flex-shrink-0">MG</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-lg">Mateo Gómez</p>
                  <p className="text-violet-200 text-sm font-medium">Trastorno fonológico · 7 años</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-white text-3xl leading-none">09:00</p>
                  <p className="text-violet-200 text-xs font-medium mt-1">45 minutos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => go("session/prep")}
                  className="inline-flex items-center justify-center gap-1.5 text-xs px-3.5 py-1.5 rounded-2xl font-bold flex-1 transition-all"
                  style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>
                  <FileText size={13} /> Preparar
                </button>
                <Btn size="sm" variant="cta" onClick={() => go("session")} className="flex-1 justify-center">
                  <Video size={13} /> Entrar ahora
                </Btn>
              </div>
            </div>
          </div>

          {/* Today's schedule */}
          <Crd>
            <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
              <h3 className="font-extrabold text-[#1C1135]">Agenda de hoy</h3>
              <Btn size="sm" variant="ghost" onClick={() => go("terapeuta/agenda")}><Calendar size={12} /> Ver completa</Btn>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {todayApts.map((apt, i) => {
                const isNext = i === 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl transition-colors hover:opacity-90"
                    style={{ background: isNext ? B.violetLight : "transparent" }}>
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="font-extrabold text-sm text-[#1C1135]">{apt.time}</p>
                      <p className="text-xs text-[#9E95B7]">{apt.dur}</p>
                    </div>
                    <div className="w-px h-8 rounded-full flex-shrink-0" style={{ background: isNext ? B.violet : "#E8E5F4" }} />
                    <Av initials={apt.av} color={apt.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm text-[#1C1135]">{apt.patient}</p>
                    </div>
                    <Bdg color={isNext ? "violet" : "gray"}>{apt.status}</Bdg>
                    {isNext && (
                      <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={12} /></Btn>
                    )}
                  </div>
                );
              })}
            </div>
          </Crd>

          {/* Solicitudes de cita — always visible */}
          <Crd className="p-4 border-2 border-orange-100" style={{ background: "#FFFBEB" }}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">Solicitudes de cita</h3>
                <p className="text-xs text-[#7C6F9A] font-medium">Revisa y confirma las solicitudes de los representantes.</p>
              </div>
              <Bdg color="orange">{pendingRequests.length} pendientes</Bdg>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-[#7C6F9A]">Desde</label>
                <input
                  type="date"
                  value={filterFrom}
                  onChange={e => setFilterFrom(e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400 font-medium text-[#1C1135]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-[#7C6F9A]">Hasta</label>
                <input
                  type="date"
                  value={filterTo}
                  onChange={e => setFilterTo(e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400 font-medium text-[#1C1135]"
                />
              </div>
              {(filterFrom || filterTo) && (
                <button onClick={() => { setFilterFrom(""); setFilterTo(""); }} className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
                  Limpiar
                </button>
              )}
            </div>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-bold text-[#1C1135]">Solicitudes al día</p>
                <p className="text-xs text-[#9E95B7] mt-1">No hay solicitudes pendientes{filterFrom || filterTo ? " en este rango de fechas" : ""}.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredRequests.map((req: any) => {
                  const initials = req.child.split(" ").map((p: string) => p[0]).join("").slice(0, 2);
                  const parentLabel = req.parent ?? "Tutor";
                  return (
                    <div key={req.id} className="flex items-center gap-3 rounded-2xl p-3 bg-white border border-orange-100 flex-wrap">
                      <Av initials={initials} color={B.orange} size="sm" />
                      <div className="flex-1 min-w-40">
                        <p className="text-sm font-extrabold text-[#1C1135]">{req.child}</p>
                        <p className="text-xs text-[#7C6F9A]">{parentLabel} · {req.date} · {req.time}</p>
                      </div>
                      <Btn size="sm" variant="outline" onClick={() => go("terapeuta/agenda")}><Calendar size={12} /> Ver agenda</Btn>
                    </div>
                  );
                })}
              </div>
            )}
          </Crd>
      </div>
    </div>
  );
}

