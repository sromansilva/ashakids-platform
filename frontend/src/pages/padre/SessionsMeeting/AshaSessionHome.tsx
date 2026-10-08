import { useState } from "react";
import { CheckCircle, Calendar } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { SESSION_THERAPIST } from "@/pages/padre/GamesShared";
import { RescheduleModal } from "@/pages/padre/SessionsMeeting/RescheduleModal";

export function AshaSessionHome({ go }: { go: (v: View) => void }) {
  const t = SESSION_THERAPIST;
  const [showReschedule, setShowReschedule] = useState(false);
  const [sessionDate, setSessionDate] = useState(t.date);
  const [sessionTime, setSessionTime] = useState(t.time);
  const [rescheduled, setRescheduled] = useState(false);

  function handleRescheduleConfirm(date: string, time: string) {
    setSessionDate(date);
    setSessionTime(time);
    setRescheduled(true);
    setShowReschedule(false);
  }

  const actions = [
    { icon: "📅", label: "Cambiar horario", onClick: () => setShowReschedule(true) },
    { icon: "💬", label: "Enviar mensaje",  onClick: () => go("padre/mensajes") },
    { icon: "📄", label: "Ver materiales",  onClick: () => go("session/prep") },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: B.violet }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full opacity-10" style={{ background: B.teal }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-10" style={{ background: B.orange }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero greeting */}
        <div className="rounded-3xl overflow-hidden mb-6 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #5B21B6 100%)` }}>
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 sm:p-10">
            <div className="flex-1">
              <Bdg color="violet">ASHA Session</Bdg>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-2 leading-tight">
                Tu próxima sesión<br />está casi lista ✨
              </h1>
              <p className="text-violet-200 font-medium leading-relaxed max-w-sm">
                Prepara el espacio, verifica tu conexión y comienza cuando estés listo.
              </p>
            </div>
            <div className="flex-shrink-0 opacity-90">
              <Ashi size={130} mood="wave" />
            </div>
          </div>
        </div>

        {/* Session card */}
        <Crd className="p-6 mb-5 shadow-md">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative">
              <Av initials={t.av} color={t.color} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="text-xl font-black text-[#1C1135]">{t.name}</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">{t.specialty}</p>
                </div>
                <Bdg color="green">{t.status}</Bdg>
              </div>
              {rescheduled && (
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2">
                  <CheckCircle size={13} /> Horario actualizado correctamente
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "📅", label: "Fecha",    val: sessionDate },
                  { icon: "⏰", label: "Hora",     val: sessionTime },
                  { icon: "⏱️", label: "Duración", val: t.duration },
                  { icon: "💻", label: "Tipo",     val: t.type },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={() => go("session/prep")}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black text-lg shadow-md shadow-violet-200 hover:shadow-lg hover:brightness-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
              <span className="text-2xl">▶</span> Entrar a la sesión
            </button>
            <div className="flex gap-2 sm:flex-col">
              {actions.map(a => (
                <button key={a.label} onClick={a.onClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-violet-50 transition-colors text-sm font-bold text-[#7C6F9A] hover:text-violet-700 whitespace-nowrap">
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>
        </Crd>

        {/* Upcoming sessions */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4">Próximas sesiones</h3>
          <div className="flex flex-col gap-3">
            {[
              { date: "02 Ago 2026", time: "15:30", therapist: "Lic. Carlos Mendoza", child: "Sofía", type: "Presencial" },
              { date: "06 Ago 2026", time: "10:00", therapist: "Dra. Ana Ruiz",       child: "Mateo", type: "Virtual"    },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3 border border-[#F5F3FF] hover:bg-[#F5F3FF] transition-colors">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: B.violetLight }}>
                  <Calendar size={16} style={{ color: B.violet }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-[#1C1135]">{s.therapist} · {s.child}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{s.date} · {s.time}</p>
                </div>
                <Bdg color={s.type === "Virtual" ? "violet" : "gray"}>{s.type}</Bdg>
              </div>
            ))}
          </div>
        </Crd>
      </div>
      {showReschedule && <RescheduleModal onClose={() => setShowReschedule(false)} onConfirm={handleRescheduleConfirm} />}
    </div>
  );
}
