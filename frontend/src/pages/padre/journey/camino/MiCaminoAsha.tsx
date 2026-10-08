import { useMiCaminoAsha } from "@/pages/padre/journey/camino/useMiCaminoAsha";
import { MiCaminoAshaElViajeASHA } from "@/pages/padre/journey/camino/MiCaminoAshaElViajeASHA";
import { MiCaminoAshaHeader } from "@/pages/padre/journey/camino/MiCaminoAshaHeader";
import { MiCaminoAshaTabContent } from "@/pages/padre/journey/camino/MiCaminoAshaTabContent";
import { Download, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────

export function MiCaminoAsha(props: Parameters<typeof useMiCaminoAsha>[0]) {
const { go, padrePlan, tab, setTab, reportViewId, setReportViewId, actFilter, setActFilter, openSession, setOpenSession, periodoMode, setPeriodoMode, historialRango, setHistorialRango, periodoDesde, setPeriodoDesde, periodoHasta, setPeriodoHasta, actSubTab, setActSubTab, actHistFilter, setActHistFilter, expandedSesion, setExpandedSesion, reporteAbierto, setReporteAbierto, isExploracion, ALLOWED_CATS, child, caminoTabs, milestones, objectives, activities, sessions, reports, badges, comments, wellness, reportView, visibleActivities, filteredActs, MUNDO_MAP, downloadReport, statusColors, typeColors } = useMiCaminoAsha(props);
return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* ── Reporte: modal pantalla completa ── */}
      {reportView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4] flex-shrink-0" style={{ background: "linear-gradient(135deg,#6D28D9,#0D9488)" }}>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,.7)" }}>Informe completo · ASHAKids</p>
                <h2 className="font-extrabold text-white text-lg leading-tight">{reportView.title}</h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: "rgba(255,255,255,.75)" }}>{reportView.date} · {reportView.therapist}</p>
              </div>
              <button onClick={() => setReportViewId(null)} className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(255,255,255,.15)" }}>
                <X size={17} color="white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider">Paciente: Mateo Gómez · 7 años · Terapia del Lenguaje</p>
              {[
                { title: "Resumen Ejecutivo", content: reportView.summary },
                { title: "Objetivos Trabajados", content: "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores." },
                { title: "Observaciones Clínicas", content: "Mateo mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida (hasta 8 min vs 5 min inicial). La racha de 7 días en Mundo ASHA correlaciona positivamente con el avance fonológico." },
                { title: "Recomendaciones para Casa", content: "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos del Bosque ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza." },
              ].map(s => (
                <div key={s.title} className="rounded-2xl p-4" style={{ background: B.bg }}>
                  <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1.5">{s.title}</p>
                  <p className="text-sm font-medium text-[#4B4264] leading-relaxed">{s.content}</p>
                </div>
              ))}
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-1.5">Firma Digital</p>
                <p className="text-sm font-medium text-[#1C1135]">Firmado por: <strong>{reportView.therapist}</strong></p>
                <p className="text-xs text-[#9E95B7] font-medium mt-0.5">Matrícula profesional: TP-2847 · {reportView.date}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3 flex-shrink-0">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => setReportViewId(null)}>Cerrar</Btn>
              <Btn variant="cta" className="flex-1 justify-center" onClick={() => downloadReport(reportView)}>
                <Download size={14} /> Descargar PDF
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <MiCaminoAshaHeader child={child} caminoTabs={caminoTabs} setTab={setTab} tab={tab} />

      {/* ─── Reportes modal ─── */}
      {reporteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReporteAbierto(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8E5F4] px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-[#1C1135] text-sm">{reporteAbierto.titulo}</h3>
              <button onClick={() => setReporteAbierto(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Este reporte resume el seguimiento registrado por el terapeuta y no constituye un diagnóstico independiente.</p>
              </div>
              {[
                {label:"Paciente", val:"Mateo García"},
                {label:"Período evaluado", val:reporteAbierto.periodo},
                {label:"Sesiones realizadas", val:"4 sesiones"},
                {label:"Asistencia", val:"100%"},
                {label:"Terapeuta", val:reporteAbierto.terapeuta},
                {label:"Fecha de publicación", val:reporteAbierto.publicado},
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm border-b border-[#F0EDF8] pb-2">
                  <span className="font-medium text-[#7C6F9A]">{item.label}</span>
                  <span className="font-bold text-[#1C1135]">{item.val}</span>
                </div>
              ))}
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Objetivos trabajados</p><p className="text-sm text-[#4B4468]">Pronunciación /r/, Comprensión verbal, Vocabulario expresivo</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Logros principales</p><p className="text-sm text-[#4B4468]">Aumento de 18 puntos porcentuales en pronunciación. Vocabulario expresivo alcanzado al 90%.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Dificultades observadas</p><p className="text-sm text-[#4B4468]">La comprensión verbal en oraciones complejas requiere más trabajo.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Recomendaciones para la familia</p><p className="text-sm text-[#4B4468]">Practicar 10 minutos diarios con cuentos. Usar tarjetas de imágenes secuenciales.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Próximos pasos</p><p className="text-sm text-[#4B4468]">Continuar con automatización del fonema /r/ y comprensión de instrucciones complejas.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content ─── */}
      <div className="max-w-7xl mx-auto">

        {/* ── Period selector card — always visible ── */}
        <MiCaminoAshaTabContent setPeriodoMode={setPeriodoMode} periodoMode={periodoMode} setHistorialRango={setHistorialRango} historialRango={historialRango} periodoDesde={periodoDesde} setPeriodoDesde={setPeriodoDesde} periodoHasta={periodoHasta} setPeriodoHasta={setPeriodoHasta} />

        <MiCaminoAshaElViajeASHA tab={tab} milestones={milestones} child={child} go={go} periodoMode={periodoMode} setActSubTab={setActSubTab} actSubTab={actSubTab} setActHistFilter={setActHistFilter} actHistFilter={actHistFilter} setExpandedSesion={setExpandedSesion} expandedSesion={expandedSesion} badges={badges} setReporteAbierto={setReporteAbierto} wellness={wellness} />
      </div>
    </div>
  );

}
