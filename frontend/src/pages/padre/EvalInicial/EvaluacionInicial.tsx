import { useEvaluacionInicial } from "@/pages/padre/EvalInicial/useEvaluacionInicial";
import { EvaluacionInicialProximosPasos } from "@/pages/padre/EvalInicial/EvaluacionInicialProximosPasos";
import { EvaluacionInicialInformacionDe } from "@/pages/padre/EvalInicial/EvaluacionInicialInformacionDe";
import { EvaluacionInicialComencemosTuPrimera } from "@/pages/padre/EvalInicial/EvaluacionInicialComencemosTuPrimera";
import { EvaluacionInicialMapaDeLaAventura } from "@/pages/padre/EvalInicial/EvaluacionInicialMapaDeLaAventura";
import React from "react";
import { ArrowLeft, ArrowRight, Check, Download, AlertTriangle, Trophy } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { ResultCategory } from "@/pages/padre/EvalInicial/types";
import { STATIONS } from "@/pages/padre/EvalInicial/data";
import { PARENT_QUESTIONS } from "@/pages/padre/EvalInicial/data";
import { PARENT_ANSWERS } from "@/pages/padre/EvalInicial/data";
import { Station1 } from "@/pages/padre/EvalInicial/Station1";
import { Station2 } from "@/pages/padre/EvalInicial/Station2";
import { Station3 } from "@/pages/padre/EvalInicial/Station3";
import { Station4 } from "@/pages/padre/EvalInicial/Station4";
import { Station5 } from "@/pages/padre/EvalInicial/Station5";

export function EvaluacionInicial(props: Parameters<typeof useEvaluacionInicial>[0]) {
const { go, childName, childAgeMonths, step, setStep, consentGeneral, setConsentGeneral, consentMic, setConsentMic, _useMic, setUseMic, stationResults, setStationResults, completedStations, setCompletedStations, currentStation, setCurrentStation, parentObs, setParentObs, processing, setProcessing, resultCategory, setResultCategory, childLangs, setChildLangs, childBackground, setChildBackground, childNotes, setChildNotes, ageYears, ageMonthsRem, handleStationComplete, handleParentObsChange, handleParentObsSubmit, downloadPdf } = useEvaluacionInicial(props);
if (step === "welcome") {
    return (
      <EvaluacionInicialComencemosTuPrimera childName={childName} ageYears={ageYears} ageMonthsRem={ageMonthsRem} setStep={setStep} go={go} />
    );
  }

  // ── Step: Consent ─────────────────────────────────────────────────────────────
  if (step === "consent") {
    const canContinue = consentGeneral;
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep("welcome")} className="flex items-center gap-2 text-sm font-bold text-[#7C6F9A] mb-6 hover:text-[#1C1135] transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
          <h2 className="text-xl font-black text-[#1C1135] mb-1">Para el adulto</h2>
          <p className="text-sm text-[#7C6F9A] mb-6">Antes de comenzar, necesitamos tu consentimiento explícito.</p>

          <Crd className="mb-4">
            <h3 className="font-extrabold text-[#1C1135] mb-3">Consentimiento específico</h3>
            <div className="space-y-3">
              {[
                "Autorizo el procesamiento de las respuestas de esta evaluación.",
                "Entiendo que se registrarán las interacciones del niño con fines orientativos.",
                "Comprendo que se generará una orientación automatizada revisable por un terapeuta.",
                "He leído que este resultado NO es un diagnóstico clínico.",
              ].map((text, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <button
                    onClick={() => { if (i === 0) setConsentGeneral(v => !v); }}
                    className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${
                      consentGeneral ? "border-violet-600 bg-violet-600" : "border-[#C4BAE0]"
                    }`}
                  >
                    {consentGeneral && <Check size={11} className="text-white" />}
                  </button>
                  <span className="text-sm font-medium text-[#4B4468] leading-snug">{text}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#9E95B7] mt-4">Consentimiento v1.0 · {new Date().toLocaleDateString("es-ES")} · Revocable en Configuración</p>
          </Crd>

          <Crd className="mb-6">
            <h3 className="font-extrabold text-[#1C1135] mb-1">Uso del micrófono (opcional)</h3>
            <p className="text-sm text-[#7C6F9A] mb-3">Algunas actividades pueden hacerse con voz. Siempre hay alternativa con botones.</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                onClick={() => setConsentMic(v => !v)}
                className={`w-5 h-5 flex-shrink-0 rounded flex items-center justify-center border-2 transition-all mt-0.5 ${
                  consentMic ? "border-violet-600 bg-violet-600" : "border-[#C4BAE0]"
                }`}
              >
                {consentMic && <Check size={11} className="text-white" />}
              </button>
              <span className="text-sm font-medium text-[#4B4468] leading-snug">
                Autorizo el uso del micrófono de forma opcional para actividades de voz.
              </span>
            </label>
          </Crd>

          <Btn
            variant="cta"
            className="w-full justify-center"
            onClick={() => { setUseMic(consentMic); setStep("context"); }}
            disabled={!canContinue}
          >
            Continuar <ArrowRight size={15} className="ml-1" />
          </Btn>
          {!canContinue && (
            <p className="text-center text-xs text-[#9E95B7] mt-2">Acepta el consentimiento para continuar.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Context ─────────────────────────────────────────────────────────────
  if (step === "context") {
    return (
      <EvaluacionInicialInformacionDe setStep={setStep} childName={childName} ageYears={ageYears} ageMonthsRem={ageMonthsRem} childLangs={childLangs} setChildLangs={setChildLangs} childBackground={childBackground} setChildBackground={setChildBackground} childNotes={childNotes} setChildNotes={setChildNotes} setCurrentStation={setCurrentStation} />
    );
  }

  // ── Step: Adventure map ────────────────────────────────────────────────────────
  if (step === "adventure-map") {
    return (
      <EvaluacionInicialMapaDeLaAventura completedStations={completedStations} currentStation={currentStation} setStep={setStep} />
    );
  }

  // ── Steps: Stations ───────────────────────────────────────────────────────────
  const stationSteps: Record<string, React.ReactElement> = {
    "station-1": <Station1 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-2": <Station2 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-3": <Station3 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-4": <Station4 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
    "station-5": <Station5 ageMonths={childAgeMonths} onComplete={handleStationComplete} />,
  };

  if (step.startsWith("station-")) {
    const stationIdx = parseInt(step.split("-")[1]) - 1;
    const station = STATIONS[stationIdx];
    return (
      <div className="min-h-screen" style={{ background: station.bg }}>
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("adventure-map")} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
              <ArrowLeft size={18} style={{ color: station.color }} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{station.icon}</span>
              <div>
                <p className="font-extrabold text-sm text-[#1C1135]">{station.name}</p>
                <p className="text-xs" style={{ color: station.color }}>Estación {station.id} de 5</p>
              </div>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: station.color + "20", color: station.color }}>
              {childAgeMonths <= 60 ? "3–5 años" : childAgeMonths <= 96 ? "6–8 años" : "9–12 años"}
            </div>
          </div>
          {stationSteps[step]}
        </div>
      </div>
    );
  }

  // ── Step: Parent observations ──────────────────────────────────────────────────
  if (step === "parent-observations") {
    const allAnswered = PARENT_QUESTIONS.every(q => parentObs[q.id]);
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">👨‍👩‍👧</div>
            <h2 className="text-xl font-black text-[#1C1135]">Cuéntanos lo que observas</h2>
            <p className="text-sm text-[#7C6F9A] mt-1">Responde brevemente sobre la comunicación de {childName} en casa.</p>
          </div>

          <div className="space-y-4 mb-6">
            {PARENT_QUESTIONS.map(q => (
              <Crd key={q.id}>
                <p className="text-sm font-bold text-[#1C1135] mb-3 leading-snug">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PARENT_ANSWERS.map(ans => (
                    <button
                      key={ans}
                      onClick={() => handleParentObsChange(q.id, ans)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        parentObs[q.id] === ans
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-[#E8E5F4] bg-white text-[#7C6F9A] hover:border-violet-200"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </Crd>
            ))}
          </div>

          <Btn
            variant="cta"
            className="w-full justify-center"
            onClick={handleParentObsSubmit}
            disabled={!allAnswered}
          >
            Completar aventura <Trophy size={15} className="ml-1" />
          </Btn>
          {!allAnswered && (
            <p className="text-center text-xs text-[#9E95B7] mt-2">Responde todas las preguntas para continuar.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Processing ───────────────────────────────────────────────────────────
  if (step === ("processing" as any) || processing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #F5F0FF 0%, #FFF8F0 100%)" }}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4 animate-bounce">🦋</div>
          <h3 className="text-xl font-black text-[#1C1135] mb-2">Preparando tu orientación...</h3>
          <p className="text-sm text-[#7C6F9A] max-w-xs mx-auto leading-relaxed">
            Estamos preparando una orientación inicial. Este resultado no reemplaza la evaluación de un terapeuta.
          </p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: B.violet, animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Child celebration ────────────────────────────────────────────────────
  if (step === "child-celebration") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #F5F0FF 100%)" }}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-2">¡Aventura completada!</h2>
          <p className="text-sm text-[#7C6F9A] mb-6">¡{childName} lo hizo increíble! Gracias por participar.</p>

          <div className="grid grid-cols-5 gap-2 mb-8">
            {STATIONS.map(s => (
              <div key={s.id} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-1" style={{ background: s.bg, border: `2px solid ${s.color}40` }}>
                  {completedStations.includes(s.id) ? "✅" : s.icon}
                </div>
                <p className="text-[10px] font-bold text-[#9E95B7] leading-tight">{s.name.split(" ").slice(0, 2).join(" ")}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl p-6 mb-6" style={{ background: "white", border: "2px solid #E8E5F4" }}>
            <div className="text-4xl mb-2">🌟</div>
            <p className="font-extrabold text-[#1C1135] mb-1">Insignia de Participación</p>
            <p className="text-xs text-[#9E95B7]">Esta insignia celebra la participación, no el desempeño clínico.</p>
          </div>

          <Btn variant="cta" className="w-full justify-center mb-3" onClick={() => setStep("adult-result")}>
            Ver resultado orientativo (adulto)
          </Btn>
          <button onClick={() => go("padre")} className="w-full text-center py-3 text-sm font-bold text-[#9E95B7] hover:text-[#7C6F9A] transition-colors">
            Volver al Centro Familiar
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Adult result ─────────────────────────────────────────────────────────
  const RESULT_INFO: Record<ResultCategory, { icon: string; label: string; desc: string; color: string; bg: string }> = {
    "sin-senales": {
      icon: "✅",
      label: "Sin señales relevantes por ahora",
      desc: "Las actividades y observaciones no muestran áreas de preocupación inmediata. Continúa con el seguimiento regular de su desarrollo.",
      color: "#16A34A",
      bg: "#F0FDF4",
    },
    "seguimiento": {
      icon: "🔍",
      label: "Seguimiento recomendado",
      desc: "Algunas respuestas sugieren que puede ser útil un seguimiento en los próximos meses. No es urgente, pero es recomendable.",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    "evaluacion-prof": {
      icon: "👩‍⚕️",
      label: "Evaluación profesional recomendada",
      desc: "Las observaciones indican que sería beneficioso consultar con un terapeuta del habla para una evaluación más detallada.",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    "evaluacion-prioritaria": {
      icon: "⚠️",
      label: "Evaluación prioritaria",
      desc: "Varias áreas muestran señales que conviene revisar pronto con un profesional especializado.",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
  };

  const result = RESULT_INFO[resultCategory];

  if (step === "adult-result") {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("child-celebration")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={18} className="text-[#7C6F9A]" />
            </button>
            <div>
              <h2 className="text-xl font-black text-[#1C1135]">Resultado orientativo</h2>
              <p className="text-xs text-[#9E95B7]">Exclusivo para el adulto responsable</p>
            </div>
          </div>

          <div className="rounded-3xl p-6 mb-4 border-2" style={{ background: result.bg, borderColor: result.color + "40" }}>
            <div className="text-4xl mb-3 text-center">{result.icon}</div>
            <h3 className="font-black text-lg text-center mb-3" style={{ color: result.color }}>{result.label}</h3>
            <p className="text-sm font-medium text-[#4B4468] leading-relaxed text-center">{result.desc}</p>
          </div>

          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: "#FFF8EC", border: "1px solid #FDE68A" }}>
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">Este resultado es orientativo y no constituye un diagnóstico clínico.</p>
          </div>

          <Crd className="mb-4 space-y-3">
            <h4 className="font-extrabold text-[#1C1135] text-sm">Detalles del resultado</h4>
            {[
              { label: "Estaciones completadas", value: `${completedStations.length} de 5` },
              { label: "Idioma del hogar", value: childLangs || "Español" },
              { label: "Información del representante", value: "Incluida" },
              { label: "Nivel de confianza", value: "Orientativo — baja certeza clínica" },
              { label: "Versión evaluación", value: "1.0-demo" },
              { label: "Versión modelo", value: "ASHA-Eval-v1" },
              { label: "Fecha", value: new Date().toLocaleDateString("es-ES") },
              { label: "Estado de revisión", value: "Pendiente" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#F0EDF8] last:border-0">
                <span className="text-xs font-medium text-[#7C6F9A]">{item.label}</span>
                <span className="text-xs font-bold text-[#1C1135]">{item.value}</span>
              </div>
            ))}
          </Crd>

          <p className="text-xs text-center text-[#9E95B7] mb-4">Datos simulados para demostración · Versión demo</p>

          <div className="space-y-3">
            <Btn variant="cta" className="w-full justify-center" onClick={() => setStep("next-steps")}>
              Próximos pasos <ArrowRight size={15} className="ml-1" />
            </Btn>
            <Btn variant="secondary" className="w-full justify-center" onClick={downloadPdf}>
              <Download size={14} className="mr-1" /> Descargar resumen orientativo
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Next steps ───────────────────────────────────────────────────────────
  return (
    <EvaluacionInicialProximosPasos setStep={setStep} childName={childName} go={go} downloadPdf={downloadPdf} />
  );

}
