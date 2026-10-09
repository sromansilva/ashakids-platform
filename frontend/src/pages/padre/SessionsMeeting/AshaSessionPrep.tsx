import { useState } from "react";
import { ChevronLeft, Check, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Crd } from "@/components/common/Crd";
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { DeviceTestPanel } from "@/pages/padre/SessionsMeeting/DeviceTestPanel";

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
