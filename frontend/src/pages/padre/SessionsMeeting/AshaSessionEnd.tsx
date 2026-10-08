import { useAshaSessionEnd } from "@/pages/padre/SessionsMeeting/useAshaSessionEnd";
import { AshaSessionEndFormularioDeSesion } from "@/pages/padre/SessionsMeeting/AshaSessionEndFormularioDeSesion";
import { AshaSessionEndShowSummaryModal } from "@/pages/padre/SessionsMeeting/AshaSessionEndShowSummaryModal";
import { B } from "@/theme/brand/B";
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { Confetti } from "@/pages/padre/GamesShared";

export function AshaSessionEnd(props: Parameters<typeof useAshaSessionEnd>[0]) {
const { go, showSummaryModal, setShowSummaryModal, showForm, setShowForm, formStep, setFormStep, formData, setFormData, formSaved, setFormSaved, showConfirm, setShowConfirm, downloadSessionPdf } = useAshaSessionEnd(props);
return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #4C1D95 50%, ${B.violet} 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <Confetti />

      {/* Session summary modal */}
      {showSummaryModal && (
        <AshaSessionEndShowSummaryModal setShowSummaryModal={setShowSummaryModal} downloadSessionPdf={downloadSessionPdf} />
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
        <AshaSessionEndFormularioDeSesion setShowForm={setShowForm} formStep={formStep} formData={formData} setFormData={setFormData} setFormSaved={setFormSaved} setFormStep={setFormStep} />
      )}
    </div>
  );

}
