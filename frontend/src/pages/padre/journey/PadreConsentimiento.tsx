import { useState } from "react";
import { FileText, User, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function PadreConsentimiento({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState<"representative" | "consents" | "summary" | "done">("representative");

  // Representative declaration
  const [repRelation, setRepRelation] = useState("");
  const [repAuthority, setRepAuthority] = useState(false);

  // Per-consent state
  const [consents, setConsents] = useState({
    dataPerfil: false,     // OBLIGATORIO
    compartirTerapeuta: false, // OBLIGATORIO para atención
    camaraSessiones: false,  // Contextual
    vozActividades: false,   // OPCIONAL
  });

  const toggleConsent = (k: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const mandatoryDone = consents.dataPerfil && consents.compartirTerapeuta;

  const consentItems = [
    {
      key: "dataPerfil" as const,
      required: true,
      icon: "📋",
      label: "Tratamiento de datos para perfil infantil",
      desc: "Permite crear y gestionar el perfil del niño en la plataforma. Necesario para usar el servicio.",
      badge: "OBLIGATORIO",
      badgeColor: "#DC2626",
      badgeBg: "#FEF2F2",
      legal: "Contenido legal pendiente de aprobación",
    },
    {
      key: "compartirTerapeuta" as const,
      required: true,
      icon: "🤝",
      label: "Compartir información con el terapeuta vinculado",
      desc: "El terapeuta aprobado y vinculado accede al expediente clínico durante la vinculación activa. Necesario para la atención terapéutica.",
      badge: "OBLIGATORIO PARA ATENCIÓN",
      badgeColor: "#DC2626",
      badgeBg: "#FEF2F2",
      legal: "Contenido legal pendiente de aprobación",
    },
    {
      key: "camaraSessiones" as const,
      required: false,
      icon: "🎥",
      label: "Cámara y micrófono para sesiones virtuales",
      desc: "Solicitud contextual: se pedirá permiso antes de cada sesión. Puedes gestionar esto desde el dispositivo en cualquier momento.",
      badge: "SOLICITUD CONTEXTUAL",
      badgeColor: "#D97706",
      badgeBg: "#FFFBEB",
      legal: null,
    },
    {
      key: "vozActividades" as const,
      required: false,
      icon: "🎤",
      label: "Uso de voz en actividades de Mundo ASHA",
      desc: "Permite que actividades educativas y recreativas usen el micrófono. Opcional: la mayoría de actividades tienen alternativa sin micrófono.",
      badge: "OPCIONAL",
      badgeColor: "#059669",
      badgeBg: "#D1FAE5",
      legal: null,
    },
  ];

  if (step === "done") return (
    <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#D1FAE5" }}>
        <CheckCircle size={32} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-black text-[#1C1135] mb-2">Preferencias registradas</h2>
      <p className="text-sm text-[#7C6F9A] font-medium mb-2 leading-relaxed">
        Tus consentimientos han quedado registrados. Puedes gestionarlos en cualquier momento desde Configuración → Privacidad.
      </p>
      <div className="rounded-2xl p-3 mb-5 text-left w-full" style={{ background: B.tealLight, border: `1px solid ${B.teal}30` }}>
        <p className="text-xs font-bold text-[#1C1135] mb-1">Resumen · Versión 1.0-demo · {new Date().toLocaleDateString("es", { day:"2-digit", month:"short", year:"numeric" })}</p>
        <div className="flex flex-col gap-1">
          {consentItems.map(c => (
            <div key={c.key} className="flex items-center gap-2 text-xs font-medium text-[#4B4869]">
              <span>{consents[c.key] ? "✅" : "⬜"}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("consents")}>
          Gestionar preferencias
        </Btn>
        <Btn variant="primary" className="flex-1 justify-center" onClick={() => go("padre/hijos")}>
          <ArrowRight size={14} /> Crear perfil del niño
        </Btn>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step === "representative" ? go("padre/recorrido") : setStep(step === "consents" ? "representative" : "consents")}
          className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF]">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1C1135]">Preferencias y consentimientos</h2>
          <p className="text-xs text-[#9E95B7] font-medium">Paso 3 de 9 · Datos simulados para demostración</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {(["representative", "consents", "summary"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: step === s ? B.violet : (["representative","consents","summary"].indexOf(step) > i ? "#059669" : "#E8E5F4"),
                color: step === s || ["representative","consents","summary"].indexOf(step) > i ? "white" : "#9E95B7",
              }}>
              {["representative","consents","summary"].indexOf(step) > i ? "✓" : i + 1}
            </div>
            <span className="text-xs font-bold" style={{ color: step === s ? B.violet : "#9E95B7" }}>
              {["Representante", "Consentimientos", "Resumen"][i]}
            </span>
            {i < 2 && <div className="w-6 h-0.5 rounded-full" style={{ background: "#E8E5F4" }} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Representative Declaration ── */}
      {step === "representative" && (
        <div className="flex flex-col gap-4">
          <Crd className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.violetLight }}>
                <User size={18} style={{ color: B.violet }} />
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135]">Declaración del representante</p>
                <p className="text-xs text-[#9E95B7] font-medium">El niño no es un usuario autónomo</p>
              </div>
            </div>
            <div className="rounded-2xl p-3 mb-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E]">
                ℹ️ El representante (padre, madre o tutor legal) actúa en nombre del niño. No se implementan múltiples representantes en esta versión; esta función está marcada como pendiente.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wider block mb-1.5">
                  Relación con el niño *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Madre", "Padre", "Tutor legal", "Otro representante autorizado"].map(rel => (
                    <button key={rel}
                      onClick={() => setRepRelation(rel)}
                      className="p-3 rounded-xl text-sm font-bold text-left border transition-all"
                      style={{
                        borderColor: repRelation === rel ? B.violet : "#E8E5F4",
                        background: repRelation === rel ? B.violetLight : "white",
                        color: repRelation === rel ? B.violet : "#4B4869",
                      }}>
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors"
                style={{ borderColor: repAuthority ? B.violet : "#E8E5F4", background: repAuthority ? B.violetLight : "white" }}>
                <input type="checkbox" checked={repAuthority} onChange={e => setRepAuthority(e.target.checked)}
                  className="mt-0.5 accent-violet-600 w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-[#1C1135] leading-snug">
                  Confirmo tener autoridad legal para representar al niño, registrarlo en la plataforma y autorizar la compartición de su información con el terapeuta asignado.
                </span>
              </label>
            </div>
          </Crd>
          <Btn variant="primary" className="w-full justify-center"
            disabled={!repRelation || !repAuthority}
            onClick={() => setStep("consents")}>
            Continuar a consentimientos <ArrowRight size={14} />
          </Btn>
        </div>
      )}

      {/* ── Step 2: Granular Consents ── */}
      {step === "consents" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-3" style={{ background: B.tealLight, border: `1px solid ${B.teal}30` }}>
            <p className="text-xs font-bold text-[#065F46]">
              Los consentimientos obligatorios son necesarios para usar el servicio. Los opcionales pueden modificarse en cualquier momento desde Configuración → Privacidad.
            </p>
          </div>
          {consentItems.map(item => (
            <div key={item.key} className="rounded-2xl border p-4 transition-all"
              style={{ borderColor: consents[item.key] ? B.violet : "#E8E5F4", background: consents[item.key] ? B.violetLight : "white" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-extrabold text-sm text-[#1C1135]">{item.label}</p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: item.badgeBg, color: item.badgeColor }}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed mb-2">{item.desc}</p>
                  {item.legal && (
                    <p className="text-xs italic text-[#9E95B7]">⚖️ {item.legal}</p>
                  )}
                </div>
                <button onClick={() => toggleConsent(item.key)}
                  className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0 ml-2"
                  style={{
                    background: consents[item.key] ? B.violet : "#D1D5DB",
                    justifyContent: consents[item.key] ? "flex-end" : "flex-start",
                  }}>
                  <span className="w-5 h-5 bg-white rounded-full shadow-sm block" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("representative")}>
              Volver
            </Btn>
            <Btn variant="primary" className="flex-1 justify-center"
              disabled={!mandatoryDone}
              onClick={() => setStep("summary")}>
              Ver resumen <ArrowRight size={14} />
            </Btn>
          </div>
          {!mandatoryDone && (
            <p className="text-xs text-center font-bold" style={{ color: "#DC2626" }}>
              Debes activar los consentimientos obligatorios para continuar.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Summary ── */}
      {step === "summary" && (
        <div className="flex flex-col gap-4">
          <Crd className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.tealLight }}>
                <FileText size={18} style={{ color: B.teal }} />
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135]">Resumen de consentimientos</p>
                <p className="text-xs text-[#9E95B7] font-medium">Versión 1.0-demo · {new Date().toLocaleDateString("es", { day:"2-digit", month:"long", year:"numeric" })}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {consentItems.map(item => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: consents[item.key] ? "#D1FAE5" : "#F5F3FF" }}>
                  <span className="text-lg flex-shrink-0">{consents[item.key] ? "✅" : "⬜"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[#1C1135]">{item.label}</p>
                    <p className="text-xs font-medium" style={{ color: consents[item.key] ? "#059669" : "#9E95B7" }}>
                      {consents[item.key] ? "Activado" : "No activado"} · {item.badge}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E]">
                Representante: {repRelation} · Autoridad declarada: Sí
              </p>
              <p className="text-xs font-medium text-[#92400E] mt-1">
                Política de retención y detalle jurídico: pendiente de aprobación.
              </p>
            </div>
          </Crd>
          <div className="flex gap-3">
            <Btn variant="outline" className="flex-1 justify-center" onClick={() => setStep("consents")}>
              Gestionar preferencias
            </Btn>
            <Btn variant="primary" className="flex-1 justify-center" onClick={() => setStep("done")}>
              <CheckCircle size={14} /> Confirmar y continuar
            </Btn>
          </div>
          <p className="text-xs text-center text-[#9E95B7] font-medium italic">
            Los términos legales definitivos se revisarán antes del lanzamiento. Los consentimientos opcionales pueden revocarse en cualquier momento.
          </p>
        </div>
      )}
    </div>
  );
}
