import { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { PadreHomeProximaSesion } from "@/pages/padre/dashboard/PadreHomeProximaSesion";
import { PadreHomeBuenosDias } from "@/pages/padre/dashboard/PadreHomeBuenosDias";
import { PadreHomeShowAddChild } from "@/pages/padre/dashboard/PadreHomeShowAddChild";
import { PadreHomeShowArticle } from "@/pages/padre/dashboard/PadreHomeShowArticle";
import { PadreHomeShowDetails } from "@/pages/padre/dashboard/PadreHomeShowDetails";
import { PadreHomeMiCaminoASHA } from "@/pages/padre/dashboard/PadreHomeMiCaminoASHA";
import { PadreHomeShowReprog } from "@/pages/padre/dashboard/PadreHomeShowReprog";
import { PadreHomeundefined } from "@/pages/padre/dashboard/PadreHomeundefined";
import { PadreHomeContentSection9 } from "@/pages/padre/dashboard/PadreHomeContentSection9";
import { PadreHomeContentSection10 } from "@/pages/padre/dashboard/PadreHomeContentSection10";
import { MessageCircle, Star, X, ChevronRight, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { kids } from "@/mocks/demo";
import { Ashi } from "@/components/illustrations/Ashi";

export function PadreHome(props: Parameters<typeof usePadreHome>[0]) {
const { go, onNotifsRead, padreUserName, padrePlan, extraNotifs, activeChild, setActiveChild, childLoading, setChildLoading, handleSetChild, searchVal, setSearchVal, showNotifs, setShowNotifs, notifsRead, setNotifsRead, showReprog, setShowReprog, showDetails, setShowDetails, showArticle, setShowArticle, showAddChild, setShowAddChild, newChildName, setNewChildName, newChildAge, setNewChildAge, addChildDone, setAddChildDone, homeToast, setHomeToast, staticNotifs, notifs, hasUnread, searchIndex, searchResults, child, recommendations, achievements, wellnessArticles, calDays, apptDays } = usePadreHome(props);
return (
    <div
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      className="relative"
    >
      {childLoading && (
        <>
          <div className="absolute inset-0 z-50 backdrop-blur-sm bg-white/50 rounded-2xl" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E5F4] px-10 py-8 flex flex-col items-center gap-4 pointer-events-auto">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#EDE9FE" }}>
                {kids[activeChild === 0 ? 1 : 0].emoji}
              </div>
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-sm font-extrabold text-[#1C1135]">Cargando datos…</p>
            </div>
          </div>
        </>
      )}
      {/* ─── Desktop Header ─── */}
      <PadreHomeBuenosDias padreUserName={padreUserName} padrePlan={padrePlan} activeChild={activeChild} handleSetChild={handleSetChild} searchVal={searchVal} setSearchVal={setSearchVal} searchResults={searchResults} go={go} setShowNotifs={setShowNotifs} setNotifsRead={setNotifsRead} onNotifsRead={onNotifsRead} hasUnread={hasUnread} showNotifs={showNotifs} notifs={notifs} />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* ─── Hero Banner ─── */}
        <PadreHomeundefined padreUserName={padreUserName} child={child} go={go} />

        {/* ─── Progreso terapéutico ─── */}
        <div className="mb-2">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
            Progreso terapéutico · ¡Pregunta a tu terapeuta cómo va tu progreso!
          </p>
        </div>
        <PadreHomeContentSection10 go={go} />

        {/* ─── Participación en Mundo ASHA ─── */}
        <div className="mb-2 mt-2">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
            Participación en Mundo ASHA · Complemento educativo y recreativo
          </p>
        </div>
        <PadreHomeContentSection9 go={go} />

        {/* ─── Evaluación Inicial pendiente ─── */}
        <div className="mb-5">
          <button
            onClick={() => go("padre/evaluacion")}
            className="w-full rounded-3xl p-5 flex items-center gap-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-2"
            style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", borderColor: B.warning + "50" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: B.warningLight }}>
              📊
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-black text-[#1C1135] text-sm">Evaluación Inicial ASHA</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: B.warningLight, color: B.warning }}>Pendiente</span>
              </div>
              <p className="text-xs font-medium text-[#7C6F9A] leading-snug">
                Identifica áreas de comunicación que podrían necesitar atención · 8–12 min
              </p>
            </div>
            <ChevronRight size={16} className="text-[#9E95B7] flex-shrink-0" />
          </button>
        </div>

        {/* ─── Mi Camino ASHA — Journey Stepper ─── */}
        <PadreHomeMiCaminoASHA go={go} />

        <PadreHomeProximaSesion go={go} setShowReprog={setShowReprog} setShowDetails={setShowDetails} child={child} recommendations={recommendations} wellnessArticles={wellnessArticles} setShowArticle={setShowArticle} />

        {/* ─── ASHI personalized recommendation ─── */}
        <div
          className="mt-5 rounded-3xl p-5 flex items-start gap-4 border border-violet-100"
          style={{ background: B.violetLight }}
        >
          <div className="flex-shrink-0">
            <Ashi size={64} mood="happy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-[#1C1135] mb-1">
              Sugerencia de navegación de ASHI
            </p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-3 max-w-lg">
              El terapeuta asignó actividades para reforzar en casa. Puedes explorarlas en el Bosque de los Cuentos. Si tienes dudas sobre cuáles realizar, consúltalo en tu próxima sesión.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => go("mundo-asha/cuentos")}
              >
                <Star size={13} /> Ir a la actividad
              </Btn>
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => go("padre/mensajes")}
              >
                <MessageCircle size={13} /> Preguntar a la
                terapeuta
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PadreHome Modals ─── */}

      {/* Toast */}
      {homeToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, #059669, #0D9488)",
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <CheckCircle size={16} /> {homeToast}
          <button
            onClick={() => setHomeToast("")}
            className="ml-1 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Reprogramar */}
      {showReprog && (
        <PadreHomeShowReprog setShowReprog={setShowReprog} setHomeToast={setHomeToast} />
      )}

      {/* Ver detalles */}
      {showDetails && (
        <PadreHomeShowDetails setShowDetails={setShowDetails} go={go} />
      )}

      {/* Article modal */}
      {showArticle && (
        <PadreHomeShowArticle setShowArticle={setShowArticle} showArticle={showArticle} go={go} />
      )}

      {/* Add child modal */}
      {showAddChild && (
        <PadreHomeShowAddChild setShowAddChild={setShowAddChild} addChildDone={addChildDone} setAddChildDone={setAddChildDone} setNewChildName={setNewChildName} setNewChildAge={setNewChildAge} newChildName={newChildName} newChildAge={newChildAge} setHomeToast={setHomeToast} />
      )}
    </div>
  );

}
