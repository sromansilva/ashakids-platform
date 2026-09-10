import { useEffect, useRef, useState } from "react";
import {
  Star, ChevronRight, ChevronLeft, ArrowRight, Check, X, Plus, Search, Download,
  Video, Clock, Mic, MicOff, VideoOff, PhoneOff, MessageCircle, Sparkles,
  Users, PlayCircle, BookOpen, Activity, Globe, Phone, CheckCircle, Calendar, Volume2,
  Pause, Play, RotateCcw, HelpCircle, Flag, FileText, BarChart2, Shield, Database, Send,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, StatCard, Skeleton, EmptyState, AshiMsg, Isotipo } from "../shared";
import { Ashi } from "./Sessions";
import { SESSION_THERAPIST, Confetti } from "./SessionsGames";

const msgs: { id: number; own: boolean; text: string }[] = [
  { id: 1, own: false, text: "Hola, \u00bfest\u00e1s listo para la sesi\u00f3n?" },
  { id: 2, own: true, text: "S\u00ed, estamos listos." },
  { id: 3, own: false, text: "Perfecto, comenzamos con el ejercicio de pronunciaci\u00f3n." },
];

// ── Reschedule Modal
function RescheduleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (date: string, time: string) => void }) {
  const dates = ["Lun 27 Jul 2026", "Mié 29 Jul 2026", "Vie 31 Jul 2026", "Lun 03 Ago 2026", "Mié 05 Ago 2026"];
  const times = ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00"];
  const [selDate, setSelDate] = useState(dates[0]);
  const [selTime, setSelTime] = useState(times[2]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-[#1C1135] flex items-center gap-2"><span>📅</span> Cambiar horario</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
            <X size={18} className="text-[#7C6F9A]" />
          </button>
        </div>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5">Selecciona una nueva fecha y hora disponibles para tu sesión.</p>
        <div className="mb-4">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Fecha</p>
          <div className="flex flex-wrap gap-2">
            {dates.map(d => (
              <button key={d} onClick={() => setSelDate(d)}
                className={`px-3 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selDate === d ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Hora</p>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <button key={t} onClick={() => setSelTime(t)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selTime === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5 border border-violet-200" style={{ background: "#F5F3FF" }}>
          <p className="text-sm font-extrabold text-[#1C1135]">Nuevo horario: <span className="text-violet-700">{selDate} · {selTime}</span></p>
          <p className="text-xs text-[#9E95B7] font-medium mt-0.5">El terapeuta recibirá una notificación de confirmación.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">Cancelar</button>
          <button onClick={() => onConfirm(selDate, selTime)}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}

// 1 ── Session Home
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

// ── Device Test Panel
function DeviceTestPanel({ onClose }: { onClose: () => void }) {
  type TestState = "idle" | "testing" | "ok" | "fail";
  const [cam, setCam] = useState<TestState>("idle");
  const [mic, setMic] = useState<TestState>("idle");
  const [net, setNet] = useState<TestState>("idle");

  function runTest(set: (s: TestState) => void) {
    set("testing");
    setTimeout(() => set("ok"), 1800 + Math.random() * 600);
  }

  function runAll() {
    setCam("idle"); setMic("idle"); setNet("idle");
    setTimeout(() => runTest(setCam), 100);
    setTimeout(() => runTest(setMic), 600);
    setTimeout(() => runTest(setNet), 1100);
  }

  const allOk = cam === "ok" && mic === "ok" && net === "ok";
  const anyTesting = cam === "testing" || mic === "testing" || net === "testing";

  function stateIcon(s: TestState) {
    if (s === "idle") return <span className="w-5 h-5 rounded-full bg-[#E8E5F4] inline-block" />;
    if (s === "testing") return <span className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin inline-block" />;
    if (s === "ok") return <CheckCircle size={20} className="text-emerald-500" />;
    return <X size={20} className="text-red-400" />;
  }

  const devices = [
    { key: "cam", label: "Cámara", icon: "📷", state: cam },
    { key: "mic", label: "Micrófono", icon: "🎤", state: mic },
    { key: "net", label: "Conexión", icon: "📶", state: net },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-[#1C1135] flex items-center gap-2"><span>🎛️</span> Probar dispositivos</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
            <X size={18} className="text-[#7C6F9A]" />
          </button>
        </div>
        <div className="flex flex-col gap-3 mb-5">
          {devices.map(d => (
            <div key={d.key} className={`flex items-center gap-4 rounded-2xl p-4 border-2 transition-all ${d.state === "ok" ? "border-emerald-200 bg-emerald-50" : d.state === "testing" ? "border-violet-300 bg-violet-50" : "border-[#E8E5F4] bg-white"}`}>
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <p className={`font-extrabold text-sm ${d.state === "ok" ? "text-emerald-700" : "text-[#1C1135]"}`}>{d.label}</p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {d.state === "idle" ? "Sin probar" : d.state === "testing" ? "Probando…" : d.state === "ok" ? "Funcionando correctamente" : "Error detectado"}
                </p>
              </div>
              {stateIcon(d.state)}
            </div>
          ))}
        </div>
        {allOk && (
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
            <CheckCircle size={16} /> ¡Todos los dispositivos están listos!
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">Cerrar</button>
          <button onClick={runAll} disabled={anyTesting}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            {anyTesting ? "Probando…" : "Probar todo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2 ── Preparation Center
export function AshaSessionPrep({ go }: { go: (v: View) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const checklist = [
    { id: "cam",   icon: "📷", label: "Cámara",            hint: "Activá el permiso de cámara en el navegador" },
    { id: "mic",   icon: "🎤", label: "Micrófono",         hint: "Verificá que el micrófono funcione correctamente" },
    { id: "net",   icon: "📶", label: "Internet",           hint: "Recomendamos al menos 5 Mbps de velocidad" },
    { id: "spk",   icon: "🔊", label: "Altavoces",          hint: "Subí el volumen y probá que se escuche bien" },
    { id: "perm",  icon: "🔐", label: "Permisos",           hint: "Concedé permisos de audio y video al navegador" },
    { id: "light", icon: "💡", label: "Iluminación",        hint: "Sentate frente a una ventana o luz natural" },
    { id: "noise", icon: "🔇", label: "Ambiente silencioso", hint: "Busca un lugar tranquilo sin ruido de fondo" },
  ];
  const allDone = checklist.every(c => checked[c.id]);

  return (
    <div style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => go("session")} className="flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:underline mb-6">
          <ChevronLeft size={15} /> Volver
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <Ashi size={80} mood={allDone ? "celebrate" : "happy"} />
          <h1 className="text-2xl font-black text-[#1C1135] mt-3">Centro de Preparación</h1>
          <p className="text-sm text-[#7C6F9A] font-medium mt-1">Verificá todo antes de ingresar a la sesión</p>
          {allDone && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-emerald-700" style={{ background: "#DCFCE7" }}>
              <CheckCircle size={16} /> ¡Todo listo para comenzar!
            </div>
          )}
        </div>

        {/* Checklist */}
        <Crd className="p-5 mb-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><span className="text-xl">✅</span> Lista de verificación</h3>
          <div className="flex flex-col gap-2">
            {checklist.map(item => (
              <button key={item.id}
                onClick={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                className={`flex items-center gap-4 rounded-2xl p-4 border-2 text-left transition-all duration-200 ${checked[item.id] ? "border-emerald-300 bg-emerald-50" : "border-[#E8E5F4] bg-white hover:border-violet-300 hover:bg-violet-50"}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${checked[item.id] ? "bg-emerald-100" : "bg-[#F5F3FF]"}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-extrabold ${checked[item.id] ? "text-emerald-700 line-through opacity-70" : "text-[#1C1135]"}`}>{item.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">{item.hint}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked[item.id] ? "bg-emerald-500 border-emerald-500" : "border-[#C4B5FD]"}`}>
                  {checked[item.id] && <Check size={13} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowDeviceTest(true)} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-violet-300 text-sm font-bold text-violet-600 hover:bg-violet-50 transition-colors">
            🎛️ Probar dispositivos
          </button>
        </Crd>

        {/* Materials + Objectives grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎒</span> Hoy necesitarás</h3>
            <div className="flex flex-col gap-2">
              {[["📒","Cuaderno"],["✏️","Lápices de colores"],["🧸","Juguete favorito"],["🧩","Tarjetas de práctica"]].map(([icon,label]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: B.violetLight }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135]">{label}</span>
                </div>
              ))}
            </div>
          </Crd>
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎯</span> Objetivo de hoy</h3>
            <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider mb-3">Hoy trabajaremos:</p>
            <div className="flex flex-col gap-2">
              {[["🗣️","Pronunciación de la R"],["👂","Comprensión verbal"],["🎮","Juego interactivo"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl p-2.5 border border-[#E8E5F4]">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135]">{label}</span>
                </div>
              ))}
            </div>
          </Crd>
        </div>

        {/* Countdown + enter */}
        <div className="rounded-3xl p-7 text-center border-2 border-violet-200 mb-6"
          style={{ background: `linear-gradient(135deg, ${B.violetLight} 0%, #DDD6FE 100%)` }}>
          <p className="text-xs font-black text-violet-500 uppercase tracking-widest mb-2">La sesión comienza en</p>
          <div className="text-6xl font-black text-violet-800 tabular-nums tracking-tight mb-2">08:12</div>
          <p className="text-sm text-violet-600 font-bold mb-5">¡Ya casi comenzamos! — ASHI</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => go("session/waiting")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-base shadow-md hover:shadow-lg hover:brightness-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
              <span className="text-xl">▶</span> Ingresar ahora
            </button>
          </div>
        </div>
      </div>
      {showDeviceTest && <DeviceTestPanel onClose={() => setShowDeviceTest(false)} />}
    </div>
  );
}

// 3 ── Waiting Room
export function AshaSessionWaiting({ go }: { go: (v: View) => void }) {
  const t = SESSION_THERAPIST;
  const tips = [
    "Respirá profundo. La sesión comenzará enseguida.",
    "Asegurate de estar en un lugar tranquilo y bien iluminado.",
    "Podés tener a mano el cuaderno y los materiales.",
    "El terapeuta revisará los objetivos al iniciar.",
  ];
  const [tipIdx] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #1E1148 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{ width: 4 + (i % 5) * 2, height: 4 + (i % 5) * 2, background: "white", opacity: 0.06 + (i % 4) * 0.03, top: `${(i * 17) % 100}%`, left: `${(i * 13 + 7) % 100}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 text-center">
        {/* Therapist avatar with pulse ring */}
        <div className="relative inline-block mb-7">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${B.violet}30`, scale: "1.4" }} />
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.2" }} />
          <div className="relative">
            <Av initials={t.av} color={t.color} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1E1148] flex items-center justify-center" style={{ background: B.teal }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Sala de espera</p>
        <h1 className="text-2xl font-black text-white mb-1">Conectando con {t.name}</h1>
        <p className="text-violet-300 text-sm font-medium mb-6">{t.specialty}</p>

        {/* Connection status */}
        <div className="rounded-2xl px-5 py-3 mb-7 inline-flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
          <span className="text-sm font-bold text-teal-300">Conectándose…</span>
        </div>

        {/* ASHI tip */}
        <div className="rounded-3xl p-5 mb-6 text-left" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Ashi size={48} mood="happy" />
            </div>
            <div>
              <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-1">ASHI te dice:</p>
              <p className="text-sm text-white font-medium leading-relaxed">{tips[tipIdx]}</p>
            </div>
          </div>
        </div>

        {/* Breathing exercise */}
        <div className="rounded-3xl p-5 mb-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">🌬️ Ejercicio de respiración</p>
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full border-4 border-violet-400/30 flex items-center justify-center animate-pulse" style={{ background: "rgba(124,58,237,0.2)" }}>
              <div className="w-12 h-12 rounded-full animate-ping" style={{ background: `${B.violet}40` }} />
            </div>
          </div>
          <p className="text-xs text-violet-300 font-medium">Inhala 4s · Sostén 4s · Exhala 4s</p>
        </div>

        <button onClick={() => go("session/active")}
          className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg shadow-violet-900/40 hover:brightness-110 transition-all"
          style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
          ▶ Entrar a la sesión
        </button>
        <button onClick={() => go("session")} className="mt-3 text-sm text-violet-400 hover:text-white font-bold transition-colors">
          Cancelar y volver
        </button>
      </div>
    </div>
  );
}

// 4 ── Active Session (video call UI)
export function AshaSessionActive({ go }: { go: (v: View) => void }) {
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [panel,    setPanel]    = useState<"chat"|"notes"|"materials"|"objectives"|null>(null);
  const [chatMsg,  setChatMsg]  = useState("");
  const [tools,    setTools]    = useState(false);
  const t = SESSION_THERAPIST;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0D0820", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Main video area */}
      <div className="flex-1 relative flex">
        {/* Therapist main video */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1C0F45 0%, #2D1B69 100%)" }}>
          {/* Simulated video — therapist avatar centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.3" }} />
              <Av initials={t.av} color={t.color} size="xl" />
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-lg">{t.name}</p>
              <p className="text-violet-300 text-sm font-medium">{t.specialty}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-bold">En vivo</span>
              </div>
            </div>
          </div>

          {/* Objective card — top left */}
          <div className="absolute top-4 left-4 rounded-2xl px-4 py-2.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-0.5">🎯 Objetivo actual</p>
            <p className="text-sm font-extrabold text-white">Pronunciación de la R</p>
          </div>

          {/* Timer + connection — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="rounded-2xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white font-bold">HD</span>
            </div>
            <div className="rounded-2xl px-3 py-1.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-sm font-black text-white tabular-nums">00:32:14</span>
            </div>
          </div>

          {/* Child PiP — bottom right */}
          <div className="absolute bottom-20 right-4 w-36 h-28 rounded-2xl overflow-hidden border-2 border-violet-400/30 shadow-2xl"
            style={{ background: camOff ? "#1C0F45" : "linear-gradient(135deg, #2D1B69 0%, #4C1D95 100%)" }}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              {camOff
                ? <><div className="text-2xl">📷</div><p className="text-xs text-violet-300 font-bold">Cámara off</p></>
                : <><Av initials="MG" color={B.orange} size="sm" /><p className="text-xs text-white font-bold mt-1">Mateo</p></>
              }
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {panel && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l" style={{ background: "#120A2E", borderColor: "rgba(255,255,255,0.08)" }}>
            {/* Panel tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {(["chat","notes","materials","objectives"] as const).map(tab => (
                <button key={tab}
                  className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors capitalize ${panel === tab ? "text-violet-300 border-b-2 border-violet-400" : "text-white/40 hover:text-white/70"}`}
                  onClick={() => setPanel(tab)}>
                  {tab === "chat" ? "💬" : tab === "notes" ? "📝" : tab === "materials" ? "📄" : "🎯"}
                </button>
              ))}
              <button onClick={() => setPanel(null)} className="px-3 text-white/40 hover:text-white/70">
                <X size={16} />
              </button>
            </div>

            {panel === "chat" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {msgs.slice(0, 3).map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.own ? "text-white rounded-tr-sm" : "text-white rounded-tl-sm"}`}
                        style={{ background: msg.own ? B.violet : "rgba(255,255,255,0.1)" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 flex gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: B.violet }}>
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {panel === "notes" && (
              <div className="flex-1 p-4 flex flex-col gap-3">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider">Notas de sesión</p>
                <textarea
                  className="flex-1 rounded-2xl p-3 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Escribí tus notas aquí…"
                  defaultValue="Mateo mostró avance en la pronunciación de /r/ vibrante. Practicar en casa: trabalenguas con /r/." />
              </div>
            )}

            {panel === "materials" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Materiales</p>
                {["Ejercicios semana 12.pdf","Guía fonemas R-L.pdf","Actividades vocabulario.pdf"].map(f => (
                  <div key={f} className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FileText size={14} className="text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-white/80 font-medium truncate flex-1">{f}</span>
                    <Download size={12} className="text-violet-400" />
                  </div>
                ))}
              </div>
            )}

            {panel === "objectives" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Objetivos</p>
                {[["🗣️","Pronunciación de la R","En progreso"],["👂","Comprensión verbal","Completado"],["🎮","Juego interactivo","Pendiente"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <span className="text-base">{icon}</span>
                    <span className="text-xs text-white/80 font-medium flex-1">{label}</span>
                    <span className={`text-xs font-bold ${status === "Completado" ? "text-emerald-400" : status === "En progreso" ? "text-amber-400" : "text-white/30"}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 h-16 flex items-center justify-center gap-2 px-4" style={{ background: "#0A0618", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Left group: main controls */}
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => setMuted(m => !m)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${muted ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{muted ? "🔇" : "🎤"}</span>
          </button>
          <button onClick={() => setCamOff(c => !c)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${camOff ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{camOff ? "📷" : "📸"}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl text-white/70 hover:bg-white/10 transition-all">
            <span className="text-lg">⛶</span>
          </button>
        </div>

        {/* Center: secondary actions */}
        <div className="flex items-center gap-2">
          {(["chat","notes","materials","objectives"] as const).map(tab => {
            const icons: Record<string, string> = { chat: "💬", notes: "📝", materials: "📄", objectives: "🎯" };
            const labels: Record<string, string> = { chat: "Chat", notes: "Notas", materials: "Docs", objectives: "Metas" };
            return (
              <button key={tab} onClick={() => setPanel(p => p === tab ? null : tab)}
                className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${panel === tab ? "bg-violet-600/30 text-violet-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
                <span className="text-base">{icons[tab]}</span>
                <span>{labels[tab]}</span>
              </button>
            );
          })}
          <button onClick={() => setTools(t => !t)}
            className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${tools ? "bg-orange-500/20 text-orange-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
            <span className="text-base">🧸</span>
            <span>Tools</span>
          </button>
        </div>

        {/* Right: leave */}
        <div className="flex items-center gap-2 ml-auto">
          {/* ASHI help */}
          <button className="w-10 h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-400 transition-all flex-shrink-0">
            <Ashi size={40} mood="happy" />
          </button>
          <button onClick={() => go("session/end")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm transition-all">
            <Phone size={14} className="rotate-[135deg]" /> Finalizar
          </button>
        </div>
      </div>

      {/* Tools overlay */}
      {tools && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-3xl p-4 shadow-2xl" style={{ background: "#1C0F45", border: "1px solid rgba(255,255,255,0.15)", zIndex: 60 }}>
          <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-3 text-center">🧸 Herramientas Interactivas</p>
          <div className="grid grid-cols-6 gap-2">
            {[["✏️","Lápiz"],["🖊️","Marcador"],["⭐","Stickers"],["😊","Emojis"],["🎨","Colores"],["🃏","Tarjetas"],["🖼️","Imágenes"],["🧩","Rompecabezas"],["🔤","Letras"],["🔢","Números"],["✏️","Dibujos"],["🗑️","Borrar"]].map(([icon, label]) => (
              <button key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-white/60 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 5 ── Session End — Celebration

const OBJETIVOS_CATALOGO = [
  "Pronunciar correctamente el fonema /r/ vibrante en palabras",
  "Comprensión de instrucciones de dos pasos",
  "Vocabulario expresivo por categorías",
  "Fluidez del habla en conversación",
  "Conciencia fonológica básica",
];

const ACTIVIDADES_CATALOGO = [
  { cat: "Cuentos", icon: "📖", items: ["El osito viajero", "El León y el Ratón"] },
  { cat: "Canciones", icon: "🎵", items: ["La canción del arcoíris"] },
  { cat: "Adivinanzas", icon: "❓", items: ["¿Qué animal soy?"] },
  { cat: "Trabalenguas", icon: "🗣️", items: ["Trabalenguas nivel 2"] },
  { cat: "Juegos", icon: "🎮", items: ["Voz aventura"] },
];

export function AshaSessionEnd({ go }: { go: (v: View) => void }) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 0 - General data
    fecha: new Date().toISOString().split("T")[0],
    hora: "10:00",
    duracion: "45",
    asistencia: "asistio" as "asistio" | "ausencia-justificada" | "ausencia-no-justificada",
    tema: "",
    // Step 1 - Objectives
    objetivos: [] as string[],
    // Step 2 - Objective performance per selected objective
    desempeno: {} as Record<string, { intentos: string; correctas: string; nivel: string; obs: string; estado: string }>,
    // Step 3 - Activities from catalog
    actividadesSeleccionadas: [] as string[],
    actividadesDetalle: {} as Record<string, { estado: string; contexto: string; objetivo: string; intentos: string; resultado: string; nivel: string; obs: string }>,
    // Step 4 - Session note
    resumen: "",
    avances: "",
    dificultades: "",
    recomendaciones: "",
    proximosPasos: "",
    notaPrivada: "",
    compartirResumen: false,
  });
  const [formSaved, setFormSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const downloadSessionPdf = () => {
    const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\()]/g, "\\$&");
    const lines = [
      "Sesion Finalizada - 30 Jul 2026",
      "Terapeuta: Dra. Ana Ruiz",
      "Duracion: 45 minutos  Inicio: 10:00 AM",
      "", "Objetivos trabajados:",
      "  - Pronunciacion de la R",
      "  - Comprension verbal",
      "  - Juego interactivo",
      "", "Notas del terapeuta:",
      "  Excelente progreso en R inicial. Continuar ejercicios en casa.",
      "", "Proxima sesion: pendiente de confirmar",
      "", "ASHAKids - Plataforma de terapia infantil",
    ];
    const body = ["BT", "/F1 16 Tf", "50 790 Td", `(${safe("Resumen de sesion - ASHAKids")}) Tj`, "/F1 10 Tf",
      ...lines.flatMap(l => ["0 -20 Td", `(${safe(l)}) Tj`]), "ET"].join("\n");
    const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    a.href = url; a.download = "resumen-sesion-30jul2026.pdf";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #4C1D95 50%, ${B.violet} 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <Confetti />

      {/* Session summary modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummaryModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">📋 Resumen de sesión</h2>
              <button onClick={() => setShowSummaryModal(false)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: B.violet }}>AR</div>
                <div>
                  <p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Terapia del Lenguaje</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#9E95B7]">Duración</p>
                  <p className="font-black text-[#1C1135] text-xl">45 min</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "📅", label: "Fecha", val: "30 Jul 2026" },
                  { icon: "⏰", label: "Inicio", val: "10:00 AM" },
                  { icon: "🎯", label: "Objetivos", val: "3 / 3" },
                  { icon: "💻", label: "Tipo", val: "Virtual" },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-3">🎯 Objetivos trabajados</p>
                {[["🗣️","Pronunciación de la R","completado"],["👂","Comprensión verbal","completado"],["🎮","Juego interactivo","completado"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-2.5 mb-1.5 last:mb-0" style={{ background: "#DCFCE7" }}>
                    <span>{icon}</span>
                    <span className="text-sm font-bold text-[#1C1135] flex-1">{label}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{status === "completado" ? "✓" : "…"}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{ background: B.violetLight }}>
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">💬 Notas del terapeuta</p>
                <p className="text-sm text-[#4B4264] font-medium leading-relaxed">Excelente progreso en R inicial. Practica en casa con los ejercicios enviados. ¡Muy buen trabajo hoy!</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3">
              <button onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors">
                Cerrar
              </button>
              <button onClick={downloadSessionPdf}
                className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: B.violet }}>
                <Download size={14} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background glow circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: B.orange }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15" style={{ background: B.teal }} />
      </div>

      <div className="relative z-10 max-w-sm">
        <div className="text-6xl mb-3 animate-bounce">🎉</div>
        <div className="mb-5" style={{ filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.5))" }}>
          <Ashi size={130} mood="celebrate" />
        </div>

        <h1 className="text-4xl font-black text-white mb-3 leading-tight">
          ¡Excelente trabajo!
        </h1>
        <p className="text-violet-200 text-lg font-medium mb-2 leading-relaxed">
          Hoy completaste otra sesión con la Dra. Ana Ruiz.
        </p>
        <p className="text-violet-300 text-sm font-medium mb-8">¡Cada sesión te acerca más a tu meta! 🌟</p>

        <div className="flex flex-col gap-3 w-full">
          {!formSaved ? (
            <button onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-2xl font-black text-white shadow-lg hover:brightness-110 transition-all"
              style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
              📋 Completar formulario de sesión
            </button>
          ) : (
            <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-white font-bold text-sm">✅ Registro de sesión guardado</p>
              <button onClick={() => go("terapeuta")} className="mt-2 text-violet-200 text-xs font-medium underline">
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && !formSaved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8E5F4] px-6 py-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-[#1C1135]">Formulario de sesión</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-[#9E95B7]"><X size={16} /></button>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= formStep ? "#7C3AED" : "#E8E5F4" }} />
                ))}
              </div>
              <p className="text-xs text-[#9E95B7] mt-2">Paso {formStep + 1} de 6</p>
            </div>

            {/* Step content */}
            <div className="p-6 flex-1">

              {/* Step 0: Datos generales */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Datos de la sesión</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Fecha</label>
                      <input type="date" value={formData.fecha} onChange={e => setFormData(d => ({ ...d, fecha: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Hora</label>
                      <input type="time" value={formData.hora} onChange={e => setFormData(d => ({ ...d, hora: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Duración (minutos)</label>
                    <input type="number" min="15" max="120" value={formData.duracion} onChange={e => setFormData(d => ({ ...d, duracion: e.target.value }))}
                      className="w-32 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-2">Estado de asistencia</label>
                    <div className="space-y-2">
                      {[
                        { val: "asistio", label: "Asistió", icon: "✅" },
                        { val: "ausencia-justificada", label: "Ausencia justificada", icon: "📋" },
                        { val: "ausencia-no-justificada", label: "Ausencia no justificada", icon: "❌" },
                      ].map(opt => (
                        <button key={opt.val} onClick={() => setFormData(d => ({ ...d, asistencia: opt.val as any }))}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${formData.asistencia === opt.val ? "border-violet-500 bg-violet-50" : "border-[#E8E5F4] hover:border-violet-200"}`}>
                          <span>{opt.icon}</span>
                          <span className="text-sm font-medium text-[#1C1135]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tema principal trabajado</label>
                    <input value={formData.tema} onChange={e => setFormData(d => ({ ...d, tema: e.target.value }))}
                      placeholder="Ej: Fonema /r/ vibrante, comprensión de instrucciones..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                  </div>
                </div>
              )}

              {/* Step 1: Objetivos trabajados */}
              {formStep === 1 && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Objetivos trabajados</h3>
                  <p className="text-sm text-[#7C6F9A]">Selecciona los objetivos abordados en esta sesión.</p>
                  {OBJETIVOS_CATALOGO.map(obj => {
                    const active = formData.objetivos.includes(obj);
                    return (
                      <button key={obj} onClick={() => setFormData(d => ({ ...d, objetivos: active ? d.objetivos.filter(o => o !== obj) : [...d.objetivos, obj] }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${active ? "border-violet-500 bg-violet-50" : "border-[#E8E5F4] hover:border-violet-200"}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${active ? "bg-violet-600 border-violet-600" : "border-[#C4BAE0]"}`}>
                          {active && <Check size={11} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#1C1135]">{obj}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Desempeño por objetivo */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Desempeño por objetivo</h3>
                  {formData.objetivos.length === 0 && (
                    <p className="text-sm text-[#9E95B7] italic">No seleccionaste objetivos en el paso anterior.</p>
                  )}
                  {formData.objetivos.map(obj => {
                    const d = formData.desempeno[obj] || { intentos: "", correctas: "", nivel: "", obs: "", estado: "en-progreso" };
                    const pct = d.intentos && d.correctas ? Math.round((+d.correctas / +d.intentos) * 100) : 0;
                    return (
                      <div key={obj} className="rounded-2xl border border-[#E8E5F4] p-4 space-y-3">
                        <p className="text-sm font-bold text-[#1C1135]">{obj}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Intentos</label>
                            <input type="number" min="0" value={d.intentos}
                              onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, intentos: e.target.value } } }))}
                              className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Correctas</label>
                            <input type="number" min="0" value={d.correctas}
                              onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, correctas: e.target.value } } }))}
                              className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                          </div>
                        </div>
                        {d.intentos && d.correctas && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-[#E8E5F4]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#7C3AED" }} />
                            </div>
                            <span className="text-xs font-extrabold" style={{ color: "#7C3AED" }}>{pct}%</span>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Nivel de ayuda</label>
                          <select value={d.nivel}
                            onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, nivel: e.target.value } } }))}
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:border-violet-400">
                            <option value="">Seleccionar...</option>
                            <option value="independiente">Independiente</option>
                            <option value="ayuda-minima">Ayuda mínima</option>
                            <option value="ayuda-moderada">Ayuda moderada</option>
                            <option value="ayuda-total">Ayuda total</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Observación</label>
                          <input value={d.obs}
                            onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, obs: e.target.value } } }))}
                            placeholder="Observación breve..."
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-2">Estado del objetivo</label>
                          <div className="flex gap-2 flex-wrap">
                            {[{ val: "en-progreso", label: "En progreso" }, { val: "pausado", label: "Pausar" }, { val: "alcanzado", label: "Alcanzado" }].map(opt => (
                              <button key={opt.val} onClick={() => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, estado: opt.val } } }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${d.estado === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Actividades realizadas */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Actividades trabajadas</h3>
                  {ACTIVIDADES_CATALOGO.map(grupo => (
                    <div key={grupo.cat}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">{grupo.icon} {grupo.cat}</p>
                      <div className="space-y-2">
                        {grupo.items.map(act => {
                          const sel = formData.actividadesSeleccionadas.includes(act);
                          const det = formData.actividadesDetalle[act] || { estado: "completada", contexto: "sesion", objetivo: "", intentos: "", resultado: "", nivel: "", obs: "" };
                          return (
                            <div key={act} className={`rounded-2xl border-2 transition-all ${sel ? "border-violet-400 bg-violet-50" : "border-[#E8E5F4]"}`}>
                              <button onClick={() => setFormData(d => ({
                                ...d,
                                actividadesSeleccionadas: sel ? d.actividadesSeleccionadas.filter(a => a !== act) : [...d.actividadesSeleccionadas, act]
                              }))} className="w-full flex items-center gap-3 p-3 text-left">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${sel ? "bg-violet-600 border-violet-600" : "border-[#C4BAE0]"}`}>
                                  {sel && <Check size={11} className="text-white" />}
                                </div>
                                <span className="text-sm font-medium text-[#1C1135]">{act}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "#E8E5F4", color: "#7C6F9A" }}>{grupo.cat}</span>
                              </button>
                              {sel && (
                                <div className="px-4 pb-4 space-y-2 border-t border-violet-200">
                                  <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Estado</label>
                                      <select value={det.estado} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, estado: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="completada">Completada</option>
                                        <option value="parcial">Parcialmente completada</option>
                                        <option value="asignada">Asignada</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Contexto</label>
                                      <select value={det.contexto} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, contexto: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="sesion">Durante la sesión</option>
                                        <option value="casa">Asignada para casa</option>
                                        <option value="mundo-asha">Asignada Mundo ASHA</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Intentos</label>
                                      <input type="number" value={det.intentos} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, intentos: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Nivel de ayuda</label>
                                      <select value={det.nivel} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, nivel: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="">--</option>
                                        <option value="independiente">Independiente</option>
                                        <option value="minima">Mínima</option>
                                        <option value="moderada">Moderada</option>
                                        <option value="total">Total</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Resultado / Observación</label>
                                    <input value={det.obs} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, obs: e.target.value } } }))}
                                      placeholder="Observación opcional..."
                                      className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Nota de sesión */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Nota de sesión</h3>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Resumen de lo trabajado</label>
                    <textarea value={formData.resumen} onChange={e => setFormData(d => ({ ...d, resumen: e.target.value }))} rows={2}
                      placeholder="¿Qué se trabajó en la sesión?" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Avances observados</label>
                    <textarea value={formData.avances} onChange={e => setFormData(d => ({ ...d, avances: e.target.value }))} rows={2}
                      placeholder="Logros y progresos de la sesión..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Dificultades encontradas</label>
                    <textarea value={formData.dificultades} onChange={e => setFormData(d => ({ ...d, dificultades: e.target.value }))} rows={2}
                      placeholder="Aspectos a trabajar con más atención..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Recomendaciones para la familia</label>
                    <textarea value={formData.recomendaciones} onChange={e => setFormData(d => ({ ...d, recomendaciones: e.target.value }))} rows={2}
                      placeholder="Indicaciones para practicar en casa..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Próximos pasos</label>
                    <input value={formData.proximosPasos} onChange={e => setFormData(d => ({ ...d, proximosPasos: e.target.value }))}
                      placeholder="Ej: Continuar con automatización del /r/" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                  </div>
                  <div className="rounded-2xl border-2 border-dashed border-[#C4BAE0] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-extrabold text-violet-700">🔒 Nota privada del terapeuta</span>
                    </div>
                    <textarea value={formData.notaPrivada} onChange={e => setFormData(d => ({ ...d, notaPrivada: e.target.value }))} rows={2}
                      placeholder="Solo visible para ti. No se comparte con el representante." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400 bg-[#FAF8FF]" />
                  </div>
                  <button onClick={() => setFormData(d => ({ ...d, compartirResumen: !d.compartirResumen }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${formData.compartirResumen ? "border-green-400 bg-green-50" : "border-[#E8E5F4] hover:border-green-200"}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${formData.compartirResumen ? "bg-green-500 border-green-500" : "border-[#C4BAE0]"}`}>
                      {formData.compartirResumen && <Check size={11} className="text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#1C1135]">Compartir resumen con el representante</p>
                      <p className="text-xs text-[#9E95B7]">El resumen y las recomendaciones serán visibles en Mi camino ASHA</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 5: Revisión y confirmación */}
              {formStep === 5 && (
                <div>
                  <div className="rounded-2xl p-4 mb-5" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                    <p className="text-sm font-bold text-orange-800 mb-1">Esta acción actualizará el expediente</p>
                    <p className="text-xs text-orange-700 leading-relaxed">Al finalizar, se agregarán los datos a Sesiones, Objetivos, Actividades, Notas y el Historial del paciente. El representante podrá ver la información marcada como compartida.</p>
                  </div>
                  <div className="rounded-2xl border border-[#E8E5F4] p-4 space-y-2 mb-5">
                    {[
                      ["Fecha", formData.fecha],
                      ["Duración", `${formData.duracion} min`],
                      ["Asistencia", formData.asistencia === "asistio" ? "Asistió" : formData.asistencia === "ausencia-justificada" ? "Ausencia justificada" : "Ausencia no justificada"],
                      ["Tema", formData.tema || "—"],
                      ["Objetivos", formData.objetivos.length > 0 ? `${formData.objetivos.length} seleccionados` : "Ninguno"],
                      ["Actividades", formData.actividadesSeleccionadas.length > 0 ? `${formData.actividadesSeleccionadas.length} seleccionadas` : "Ninguna"],
                      ["Nota de sesión", formData.resumen ? "Redactada" : "—"],
                      ["Compartir con familia", formData.compartirResumen ? "Sí" : "No"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="font-medium text-[#7C6F9A]">{k}</span>
                        <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => { setFormSaved(true); setShowForm(false); }}
                      className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm shadow-lg"
                      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
                      Finalizar registro de sesión
                    </button>
                    <button onClick={() => { setFormSaved(true); setShowForm(false); }}
                      className="w-full py-3 rounded-2xl font-bold text-sm border-2 border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                      Guardar como borrador
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#9E95B7] hover:text-red-500 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer nav */}
            {formStep < 5 && (
              <div className="sticky bottom-0 bg-white border-t border-[#E8E5F4] px-6 py-4 flex gap-3 rounded-b-3xl">
                {formStep > 0 && (
                  <button onClick={() => setFormStep(s => s - 1)}
                    className="px-5 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-gray-50">
                    Atrás
                  </button>
                )}
                <button onClick={() => setFormStep(s => s + 1)}
                  className="flex-1 py-2.5 rounded-2xl font-extrabold text-white text-sm" style={{ background: "#7C3AED" }}>
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 6 ── Session Summary + Rating + Rewards
export function AshaSessionSummary({ go }: { go: (v: View) => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => go("session")} className="flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:underline mb-6">
          <ChevronLeft size={15} /> Volver a sesiones
        </button>

        <h1 className="text-2xl font-black text-[#1C1135] mb-6">📋 Resumen de sesión</h1>

        {/* Session info */}
        <Crd className="p-6 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <Av initials="AR" color={B.violet} size="lg" />
            <div>
              <p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Terapia del Lenguaje</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-[#9E95B7] font-medium">Duración</p>
              <p className="font-black text-[#1C1135] text-xl">45:22</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📅", label: "Fecha",    val: "29 Jul 2026" },
              { icon: "⏰", label: "Inicio",   val: "10:00 AM"    },
              { icon: "🎯", label: "Objetivos",val: "3/4"          },
              { icon: "💻", label: "Tipo",     val: "Virtual"     },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
              </div>
            ))}
          </div>
        </Crd>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {/* Objectives */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎯</span> Objetivos</h3>
            <div className="flex flex-col gap-2">
              {[["🗣️","Pronunciación de la R","completado"],["👂","Comprensión verbal","completado"],["🎮","Juego interactivo","completado"]].map(([icon,label,status]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: status === "completado" ? "#DCFCE7" : B.violetLight }}>
                  <span>{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135] flex-1">{label}</span>
                  <span className={`text-xs font-extrabold ${status === "completado" ? "text-emerald-600" : "text-[#9E95B7]"}`}>
                    {status === "completado" ? "✓" : "…"}
                  </span>
                </div>
              ))}
            </div>
          </Crd>

          {/* Therapist comments */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">💬</span> Nota del terapeuta</h3>
            <div className="rounded-2xl p-4" style={{ background: B.violetLight }}>
              <p className="text-sm text-[#4B4869] leading-relaxed font-medium italic">
                &ldquo;Mateo tuvo un excelente avance en la /r/ vibrante. Practicar trabalenguas en casa 3 veces por día. La sesión fue muy productiva y el niño se mostró muy motivado.&rdquo;
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#F5F3FF] flex items-center gap-2">
              <Av initials="AR" color={B.violet} size="sm" />
              <div>
                <p className="text-xs font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
                <p className="text-xs text-[#9E95B7] font-medium">Terapeuta del Lenguaje</p>
              </div>
            </div>
          </Crd>
        </div>

        {/* Home exercises */}
        <Crd className="p-5 mb-5">
          <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="text-lg">📚</span> Ejercicios para casa</span>
            <Btn size="sm" variant="ghost"><Download size={13} /> Descargar PDF</Btn>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: "🗣️", label: "Trabalenguas", desc: "Practicar 3 veces al día, 10 repeticiones",  pts: "+10 ⭐" },
              { icon: "📖", label: "Cuento",        desc: "Leer el cuento del Bosque de las letras",    pts: "+15 ⭐" },
              { icon: "🎵", label: "Canción",       desc: "Escuchar La canción de las R juntos",         pts: "+12 ⭐" },
              { icon: "✏️", label: "Escritura",     desc: "Escribir 5 palabras con R vibrante",         pts: "+20 ⭐" },
            ].map(ex => (
              <div key={ex.label} className="flex items-start gap-3 rounded-2xl p-4 border border-[#E8E5F4]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: B.violetLight }}>{ex.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{ex.label}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium leading-snug">{ex.desc}</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600 flex-shrink-0">{ex.pts}</span>
              </div>
            ))}
          </div>
        </Crd>

        {/* Next session */}
        <Crd className="p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#DCFCE7" }}>📅</div>
            <div className="flex-1">
              <p className="font-extrabold text-[#1C1135]">Próxima sesión</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Miérc. 6 de agosto · 10:00 AM · Dra. Ana Ruiz</p>
            </div>
            <Btn size="sm" variant="primary">Ver detalles</Btn>
          </div>
        </Crd>

        {/* Rating */}
        {!submitted ? (
          <Crd className="p-6 mb-5">
            <h3 className="font-extrabold text-[#1C1135] mb-1 flex items-center gap-2"><span className="text-lg">⭐</span> Calificá esta sesión</h3>
            <p className="text-sm text-[#7C6F9A] font-medium mb-5">Tu opinión ayuda a mejorar la experiencia</p>
            <div className="flex gap-2 justify-center mb-5">
              {[1,2,3,4,5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-125 active:scale-95">
                  <Star size={36}
                    className={`transition-colors ${i <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="flex flex-col gap-3">
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="¿Querés compartir algo sobre la sesión? (opcional)"
                  className="w-full rounded-2xl p-4 text-sm border border-[#E8E5F4] focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 resize-none font-medium"
                  style={{ background: B.violetLight }} rows={3} />
                <Btn variant="cta" className="w-full justify-center" onClick={() => setSubmitted(true)}>
                  Enviar calificación
                </Btn>
              </div>
            )}
          </Crd>
        ) : (
          <Crd className="p-5 mb-5 text-center">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-extrabold text-[#1C1135]">¡Gracias por tu calificación! 🙏</p>
          </Crd>
        )}

        {/* Mundo ASHA integration */}
        <div className="rounded-3xl p-6" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 100%)` }}>
          <div className="flex items-center gap-3 mb-4">
            <Ashi size={56} mood="celebrate" />
            <div>
              <p className="font-black text-white text-base">¡Muy bien, Mateo!</p>
              <p className="text-violet-200 text-sm font-medium">Ahora puedes reforzar lo aprendido:</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { emoji: "🌳", title: "Bosque de los Cuentos",   desc: "Lee este cuento para practicar",    view: "mundo-asha/cuentos"      as View, bg: "#DCFCE7", color: "#16A34A" },
              { emoji: "🎵", title: "Montaña Musical",         desc: "Escucha la Canción de las Letras",  view: "mundo-asha/canciones"    as View, bg: "#F3E8FF", color: "#7C3AED" },
              { emoji: "🗣️", title: "Valle de Adivinanzas",    desc: "Resuelve 3 actividades nuevas",     view: "mundo-asha/adivinanzas"  as View, bg: "#FEF3C7", color: "#B45309" },
            ].map(w => (
              <button key={w.title} onClick={() => go(w.view)}
                className="rounded-2xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-white/20"
                style={{ background: w.bg }}>
                <div className="text-3xl mb-2">{w.emoji}</div>
                <p className="font-extrabold text-sm" style={{ color: w.color }}>{w.title}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: w.color, opacity: 0.7 }}>{w.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TerapeutaDatosActividad ────────────────────────────────────────────────────
export function TerapeutaDatosActividad({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState<"todos" | "asignadas" | "exploracion">("todos");

  const sessions = [
    { id: "ASHA-A3F1", patient: "B.R.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-22", duration: "4m 38s", scenes: 3, hints: 1, pauses: 0, inputMode: "manual", participation: "Completada" },
    { id: "ASHA-B2C9", patient: "M.L.", activity: "Montaña Musical", type: "asignada", date: "2026-08-22", duration: "5m 12s", scenes: 3, hints: 0, pauses: 1, inputMode: "sin micrófono", participation: "Completada" },
    { id: "ASHA-C7D4", patient: "S.T.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "3m 57s", scenes: 2, hints: 4, pauses: 0, inputMode: "botones", participation: "Incompleta" },
    { id: "ASHA-D5E8", patient: "B.R.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "6m 01s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-E1F3", patient: "M.L.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-20", duration: "5m 44s", scenes: 3, hints: 0, pauses: 0, inputMode: "con micrófono (simulado)", participation: "Completada" },
    { id: "ASHA-F2G6", patient: "S.T.", activity: "Isla Creativa", type: "exploracion", date: "2026-08-23", duration: "6m 22s", scenes: 4, hints: 1, pauses: 0, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-G4H1", patient: "B.R.", activity: "Laboratorio · Circuito", type: "asignada",   date: "2026-08-23", duration: "7m 48s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-H7J2", patient: "M.L.", activity: "Laboratorio · Asociación", type: "exploracion", date: "2026-08-23", duration: "3m 05s", scenes: 1, hints: 0, pauses: 0, inputMode: "botones", participation: "Completada" },
  ];

  const filtered = sessions.filter(s => filter === "todos" || (filter === "asignadas" ? s.type === "asignada" : s.type === "exploracion"));

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
          <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Vista de terapeuta · Solo uso interno</p>
          <h1 className="text-2xl font-black text-white mb-1">Datos de actividad · Mundo ASHA</h1>
          <p className="text-sm text-violet-200 font-medium">Registros de participación pseudonimizados · No reemplaza la evaluación clínica</p>
        </div>

        {/* Notice */}
        <div className="rounded-2xl p-4 mb-5 flex items-start gap-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
          <Shield size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#5B21B6] leading-relaxed">
            Estos datos son <strong>registros de participación</strong>, no evaluaciones clínicas. No usar como base para diagnóstico ni como sustituto de la sesión terapéutica. Los identificadores de paciente están pseudonimizados.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["todos", "asignadas", "exploracion"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all ${filter === f ? "border-violet-500 bg-violet-600 text-white" : "border-[#E8E5F4] bg-white text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}>
              {f === "todos" ? "Todos" : f === "asignadas" ? "Asignadas ✓" : "Exploración libre"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDF8]">
                  {["ID sesión", "Paciente", "Actividad", "Tipo", "Fecha", "Duración", "Pistas", "Pausas", "Entrada", "Resultado"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={i} className="border-b border-[#F8F7FF] hover:bg-[#F5F3FF] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#7C6F9A]">{s.id}</td>
                    <td className="px-4 py-3 font-extrabold text-[#1C1135]">{s.patient}</td>
                    <td className="px-4 py-3 font-medium text-[#4B4869] whitespace-nowrap">{s.activity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === "asignada" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.type === "asignada" ? "Asignada ✓" : "Exploración"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4B4869]">{s.duration}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.hints}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.pauses}</td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.inputMode}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.participation === "Completada" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.participation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "#F5F3FF" }}>
          <Database size={13} className="text-violet-400 flex-shrink-0" />
          <p className="text-xs font-bold text-[#7C6F9A]">Esquema de datos simulados · pendiente de aprobación regulatoria · v0.3-demo</p>
        </div>
      </div>
    </div>
  );
}

// ── AdminCalidadDatos ──────────────────────────────────────────────────────────
export function AdminCalidadDatos({ go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<"cobertura" | "arquitectura" | "consentimiento">("cobertura");

  const dataLevels = [
    {
      level: "Nivel 1",
      name: "Telemetría de producto",
      color: "#0D9488",
      bgColor: "#D1FAE5",
      consent: "Implícito en TyC",
      examples: ["Tiempo en pantalla", "Navegación entre vistas", "Errores de interfaz", "Abandono de flujo"],
      rows: 12450,
      coverage: 98,
    },
    {
      level: "Nivel 2",
      name: "Seguimiento terapéutico",
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      consent: "Consentimiento informado explícito",
      examples: ["Actividades completadas", "Tiempo por ronda", "Pistas solicitadas", "Modalidad de entrada"],
      rows: 3210,
      coverage: 87,
    },
    {
      level: "Nivel 3",
      name: "Investigación / ML",
      color: "#D97706",
      bgColor: "#FFFBEB",
      consent: "Opt-in separado · desactivado por defecto",
      examples: ["Patrones de interacción anonimizados", "Metadatos de sesión", "Secuencia de intentos"],
      rows: 410,
      coverage: 12,
    },
  ];

  const architectureSteps = [
    { icon: "📱", label: "Dispositivo cliente", desc: "Captura interacción · sin audio real" },
    { icon: "🔑", label: "Pseudonimización", desc: "ID real → ID hash · en edge antes de transmitir" },
    { icon: "🛡️", label: "Clasificación por nivel", desc: "N1/N2/N3 según consentimiento activo" },
    { icon: "🗄️", label: "Almacén segregado", desc: "Tres buckets independientes · sin cruce" },
    { icon: "🔬", label: "Análisis / ML (N3)", desc: "Solo si opt-in activo · modelo diferencial" },
    { icon: "📊", label: "Vista terapeuta (N2)", desc: "Participación agregada · sin microdatos" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #1C1135 0%, #2D1B6B 100%)" }}>
          <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-1">Panel de administración · Acceso restringido</p>
          <h1 className="text-2xl font-black text-white mb-1">Calidad de datos · Mundo ASHA</h1>
          <p className="text-sm text-violet-300 font-medium">Arquitectura ML · Consentimientos · Cobertura</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border border-[#E8E5F4] rounded-2xl p-1 bg-white">
          {(["cobertura", "arquitectura", "consentimiento"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all capitalize ${tab === t ? "bg-[#1C1135] text-white" : "text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}>
              {t === "cobertura" ? "Cobertura" : t === "arquitectura" ? "Arquitectura ML" : "Consentimientos"}
            </button>
          ))}
        </div>

        {/* COBERTURA */}
        {tab === "cobertura" && (
          <div className="flex flex-col gap-4">
            {dataLevels.map((dl, i) => (
              <div key={i} className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: dl.bgColor, color: dl.color }}>{dl.level}</span>
                    <h3 className="font-extrabold text-[#1C1135] mt-2">{dl.name}</h3>
                    <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">Consentimiento: {dl.consent}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-2xl" style={{ color: dl.color }}>{dl.rows.toLocaleString()}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">registros simulados</p>
                  </div>
                </div>
                <div className="h-2 rounded-full mb-3" style={{ background: "#F0EDF8" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${dl.coverage}%`, background: dl.color }} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#9E95B7]">Cobertura de consentimiento</p>
                  <p className="text-xs font-extrabold" style={{ color: dl.color }}>{dl.coverage}%</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dl.examples.map((ex, j) => (
                    <span key={j} className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: dl.bgColor, color: dl.color }}>{ex}</span>
                  ))}
                </div>
              </div>
            ))}
            {/* ML banner */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <span className="text-base">🔬</span>
              <div>
                <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
                <p className="text-xs font-medium text-[#B45309] mt-0.5">Los datos N3 no se procesan actualmente. El pipeline ML requiere aprobación regulatoria y DPA antes de activarse.</p>
              </div>
            </div>
            {/* Per-world breakdown */}
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
              <h3 className="font-extrabold text-[#1C1135] mb-1">Cobertura por mundo · Registros N2 simulados</h3>
              <p className="text-xs text-[#9E95B7] font-medium mb-4">Eventos de participación (sin microdatos · sin PII) · N3 no elegible en esta demo</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0EDF8]">
                      {["Mundo", "Sesiones", "Completadas", "Eventos N2", "N3 elegible"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Bosque de los Cuentos", sessions: 28, completed: 24, n2Events: 140 },
                      { name: "Montaña Musical",       sessions: 19, completed: 17, n2Events: 95  },
                      { name: "Valle de Adivinanzas",  sessions: 23, completed: 16, n2Events: 86  },
                      { name: "Isla Creativa",          sessions: 7,  completed: 6,  n2Events: 34  },
                      { name: "Laboratorio de Juegos", sessions: 11, completed: 9,  n2Events: 58  },
                    ].map((w, i) => (
                      <tr key={i} className="border-b border-[#F8F7FF] hover:bg-[#F5F3FF] transition-colors">
                        <td className="px-3 py-2.5 font-extrabold text-[#1C1135]">{w.name}</td>
                        <td className="px-3 py-2.5 text-[#4B4869]">{w.sessions}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{w.completed}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-[#7C3AED]">{w.n2Events}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">No activo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ARQUITECTURA */}
        {tab === "arquitectura" && (
          <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6">
            <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Flujo de datos · Prototipo v0.3</h2>
            <p className="text-xs text-[#9E95B7] font-medium mb-5">Esquema simplificado para revisión regulatoria · pendiente de aprobación</p>
            <div className="flex flex-col gap-3">
              {architectureSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: "#F5F3FF" }}>{step.icon}</div>
                    {i < architectureSteps.length - 1 && <div className="w-0.5 h-4 bg-[#E8E5F4] mt-1" />}
                  </div>
                  <div className="pt-1">
                    <p className="font-extrabold text-sm text-[#1C1135]">{step.label}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E] leading-relaxed">
                ⚠️ <strong>Prototipo de demostración</strong>: Este esquema es conceptual y no está auditado. El pipeline real requerirá revisión de seguridad, DPA con proveedores de nube, y aprobación del DPO antes de producción.
              </p>
            </div>
          </div>
        )}

        {/* CONSENTIMIENTO */}
        {tab === "consentimiento" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
              <h2 className="font-extrabold text-[#1C1135] text-lg mb-4">Estado de consentimientos · Demo</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Consentimiento de plataforma (N1)", pct: 100, color: "#0D9488", note: "Obligatorio · 100% cobertura" },
                  { label: "Consentimiento terapéutico (N2)", pct: 87, color: "#7C3AED", note: "Opt-in explícito · 87% de usuarios activos" },
                  { label: "Consentimiento ML/investigación (N3)", pct: 12, color: "#D97706", note: "Opt-in separado · desactivado por defecto · 12% voluntarios" },
                ].map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-extrabold text-[#1C1135]">{c.label}</p>
                      <p className="text-sm font-extrabold" style={{ color: c.color }}>{c.pct}%</p>
                    </div>
                    <div className="h-2 rounded-full mb-1" style={{ background: "#F0EDF8" }}>
                      <div className="h-2 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <p className="text-xs text-[#9E95B7] font-medium">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
              <Shield size={15} className="text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-[#5B21B6] leading-relaxed">
                Los consentimientos N2 y N3 son separados e independientes. La revocación de N3 no afecta N2. Los datos N3 existentes se eliminan en ciclo de 30 días tras revocación. Texto legal pendiente de aprobación del DPO.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

