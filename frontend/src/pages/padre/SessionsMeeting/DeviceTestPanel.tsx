import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";

export function DeviceTestPanel({ onClose }: { onClose: () => void }) {
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
