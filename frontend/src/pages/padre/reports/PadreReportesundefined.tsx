import type { usePadreReportes } from "@/pages/padre/reports/usePadreReportes";
import { X, ChevronRight, Eye, Download, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreReportes>, "toast" | "selectedReport" | "setReportViewId" | "downloadReport" | "setTab" | "tab" | "sessions" | "setOpenSession" | "openSession" | "downloadPdf" | "showToast" | "reports">;
export function PadreReportesundefined({ toast, selectedReport, setReportViewId, downloadReport, setTab, tab, sessions, setOpenSession, openSession, downloadPdf, showToast, reports }: Props) {
return (<div
      className="p-4 sm:p-6 max-w-3xl"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg,#059669,#0D9488)",
          }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Report modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4] flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg,#6D28D9,#0D9488)",
              }}
            >
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-widest mb-0.5"
                  style={{ color: "rgba(255,255,255,.7)" }}
                >
                  Informe completo · ASHAKids
                </p>
                <h2 className="font-extrabold text-white text-lg leading-tight">
                  {selectedReport.title}
                </h2>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: "rgba(255,255,255,.75)" }}
                >
                  {selectedReport.date} ·{" "}
                  {selectedReport.therapist}
                </p>
              </div>
              <button
                onClick={() => setReportViewId(null)}
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <X size={17} color="white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider">
                Paciente: Mateo Gómez · 7 años · Terapia del
                Lenguaje
              </p>
              {[
                {
                  title: "Resumen Ejecutivo",
                  content: selectedReport.summary,
                },
                {
                  title: "Objetivos Trabajados",
                  content:
                    "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores.",
                },
                {
                  title: "Observaciones Clínicas",
                  content:
                    "Mateo mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida (hasta 8 min vs 5 min inicial). La racha de 7 días en Mundo ASHA correlaciona positivamente con el avance fonológico.",
                },
                {
                  title: "Recomendaciones para Casa",
                  content:
                    "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos del Bosque ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl p-4"
                  style={{ background: B.bg }}
                >
                  <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1.5">
                    {s.title}
                  </p>
                  <p className="text-sm font-medium text-[#4B4264] leading-relaxed">
                    {s.content}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-1.5">
                  Firma Digital
                </p>
                <p className="text-sm font-medium text-[#1C1135]">
                  Firmado por:{" "}
                  <strong>{selectedReport.therapist}</strong>
                </p>
                <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                  Matrícula profesional: TP-2847 ·{" "}
                  {selectedReport.date}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3 flex-shrink-0">
              <button
                onClick={() => setReportViewId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => downloadReport(selectedReport)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: B.violet }}
              >
                <Download size={14} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">
          Reportes de Mateo
        </h1>
        <p className="text-sm text-[#7C6F9A] font-medium">
          Historial de sesiones e informes mensuales de la Dra.
          Ana Ruiz.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { v: "24", l: "Sesiones totales" },
          { v: "78%", l: "Progreso general" },
          { v: "4.9★", l: "Valoración terapeuta" },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-white rounded-2xl p-4 border border-[#E8E5F4] text-center"
          >
            <p
              className="text-xl font-black"
              style={{ color: B.violet }}
            >
              {s.v}
            </p>
            <p className="text-xs text-[#7C6F9A] font-medium">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-white border border-[#E8E5F4] rounded-2xl p-1">
        {(
          [
            ["sesiones", "🎥 Sesiones"],
            ["progreso", "📊 Progreso Mensual"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 py-2 rounded-xl text-sm font-extrabold transition-all"
            style={{
              background: tab === id ? B.violet : "transparent",
              color: tab === id ? "white" : B.textMid,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sesiones tab */}
      {tab === "sesiones" && (
        <div className="flex flex-col gap-3">
          {sessions.map((s, i) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-violet-50/40 transition-colors"
                onClick={() =>
                  setOpenSession(openSession === i ? null : i)
                }
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background:
                      s.type === "virtual"
                        ? B.violetLight
                        : B.tealLight,
                  }}
                >
                  {s.type === "virtual" ? "🎥" : "🏥"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          s.type === "virtual"
                            ? B.violetLight
                            : B.tealLight,
                        color:
                          s.type === "virtual"
                            ? B.violet
                            : B.teal,
                      }}
                    >
                      {s.type}
                    </span>
                    <span className="text-xs text-[#9E95B7] font-medium">
                      {s.duration}
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1135]">
                    {s.date} · {s.time}
                  </p>
                  <p className="text-xs text-[#7C6F9A] font-medium">
                    {s.therapist}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[#9E95B7] flex-shrink-0"
                  style={{
                    transform:
                      openSession === i
                        ? "rotate(90deg)"
                        : "none",
                    transition: "transform .2s",
                  }}
                />
              </button>
              {openSession === i && (
                <div className="px-4 pb-4 border-t border-[#E8E5F4]">
                  <div className="mt-3 mb-3">
                    <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">
                      Objetivos trabajados
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.goals.map((g) => (
                        <span
                          key={g}
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: B.violetLight,
                            color: B.violet,
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-3 mb-3"
                    style={{ background: B.bg }}
                  >
                    <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1">
                      Notas clínicas
                    </p>
                    <p className="text-sm text-[#4B4264] font-medium leading-relaxed">
                      {s.notes}
                    </p>
                  </div>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      downloadPdf(`sesion-${s.id}.pdf`, `Sesion ${s.date}`, [
                        `Fecha: ${s.date}  Hora: ${s.time}  Duracion: ${s.duration}`,
                        `Terapeuta: ${s.therapist}`,
                        `Modalidad: Virtual`,
                        "", "Objetivos trabajados:",
                        ...s.goals.map((g: string) => `  - ${g}`),
                        "", "Notas clinicas:",
                        `  ${s.notes}`,
                        "", "ASHAKids - Plataforma de terapia infantil",
                      ]);
                      showToast("Descargando notas de sesión...");
                    }}
                  >
                    <Download size={12} /> Descargar notas
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progreso Mensual tab */}
      {tab === "progreso" && (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-[#E8E5F4] p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: B.violetLight }}
                >
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-[#1C1135] text-sm leading-tight">
                      {r.title}
                    </p>
                    {r.fav && (
                      <span className="text-yellow-400 flex-shrink-0">
                        ⭐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">
                    {r.date} · {r.therapist}
                  </p>
                  <div className="mt-1">
                    <span
                      className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          r.status === "activo"
                            ? B.orangeLight
                            : B.successLight,
                        color:
                          r.status === "activo"
                            ? B.orange
                            : B.success,
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium mt-2 leading-relaxed">
                    {r.summary}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F5F3FF] flex gap-2">
                <button
                  onClick={() => setReportViewId(r.id)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Eye size={12} /> Ver
                </button>
                <button
                  onClick={() => downloadReport(r)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>);
}
