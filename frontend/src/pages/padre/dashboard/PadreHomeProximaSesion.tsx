import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Video, FileText, Clock, ChevronRight, Eye, TrendingUp, RefreshCw } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";

type Props = Pick<ReturnType<typeof usePadreHome>, "go" | "setShowReprog" | "setShowDetails" | "child" | "recommendations" | "wellnessArticles" | "setShowArticle"> & { nextSessionAppt?: ReturnType<typeof usePadreHome>["nextSessionAppt"] };
export function PadreHomeProximaSesion({ go, setShowReprog, setShowDetails, child, recommendations, wellnessArticles, setShowArticle, nextSessionAppt }: Props) {
  const therapistName = nextSessionAppt?.therapist ?? "Dra. Ana Ruiz";
  const therapistInitials = therapistName.split(" ").map((w: string) => w[0]).filter(Boolean).slice(-2).join("").toUpperCase() || "AR";
  const apptStatus = nextSessionAppt?.status ?? "confirmada";
  const statusColor = apptStatus === "confirmada" ? "green" : apptStatus === "cancelada" ? "red" : "orange";
return (<div className="flex flex-col gap-5">
          {/* Next session premium card */}
          <Crd
            className="p-5 sm:p-6"
            style={{ background: "rgba(186,230,253,0.35)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135] text-base">
                Próxima Sesión
              </h3>
              <Bdg color={statusColor}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />{" "}
                {apptStatus.charAt(0).toUpperCase() + apptStatus.slice(1)}
              </Bdg>
            </div>
            <div className="flex items-start gap-4">
              <Av initials={therapistInitials} color={B.violet} size="xl" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#1C1135] text-lg leading-tight">
                  {therapistName}
                </p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-3">
                  Terapia del Lenguaje · {child?.name ?? "Paciente"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    ["📅", "Fecha", nextSessionAppt?.date ?? "30 Jul 2026"],
                    ["🕙", "Hora", nextSessionAppt?.time ?? "10:00 AM"],
                    ["⏱️", "Duración", "45 min"],
                    ["🎥", "Tipo", nextSessionAppt?.type === "virtual" ? "Virtual" : "Presencial"],
                  ].map(([icon, lbl, val]) => (
                    <div
                      key={lbl}
                      className="rounded-2xl p-2.5 border border-[#F0EDF8]"
                      style={{ background: B.bg }}
                    >
                      <p className="text-xs text-[#9E95B7] font-bold mb-0.5">
                        {icon} {lbl}
                      </p>
                      <p className="text-sm font-extrabold text-[#1C1135]">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Countdown pill */}
                <div
                  className="rounded-2xl p-3 flex items-center gap-3 mb-4"
                  style={{ background: B.violetLight }}
                >
                  <Clock
                    size={16}
                    style={{ color: B.violet }}
                    className="flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-[#7C6F9A] font-bold">
                      La sesión comienza en
                    </p>
                    <p
                      className="text-xl font-black"
                      style={{ color: B.violet }}
                    >
                      08:12:43
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[#9E95B7] font-medium">
                      Objetivo del día
                    </p>
                    <p className="text-xs font-extrabold text-[#1C1135]">
                      Pronunciación de la R
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Btn
                    variant="cta"
                    size="sm"
                    onClick={() => go("session")}
                  >
                    <Video size={13} /> Entrar
                  </Btn>
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowReprog(true)}
                  >
                    <RefreshCw size={13} /> Reprogramar
                  </Btn>
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(true)}
                  >
                    <Eye size={13} /> Ver detalles
                  </Btn>
                </div>
              </div>
            </div>
          </Crd>

          {/* Progress card — pure CSS, no recharts */}
          <Crd
            className="p-5 sm:p-6"
            style={{ background: "rgba(254,252,192,0.55)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Progreso de {child.name}
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Comparativo mensual · 2026
                </p>
              </div>
              <Bdg color="green">
                <TrendingUp size={11} /> +23% este mes
              </Bdg>
            </div>
            {/* CSS bar chart */}
            {(() => {
              const barData = [
                { mes: "Feb", val: 42 },
                { mes: "Mar", val: 58 },
                { mes: "Abr", val: 51 },
                { mes: "May", val: 67 },
                { mes: "Jun", val: 73 },
                { mes: "Jul", val: 89 },
              ];
              const maxVal = 89;
              const BAR_MAX = 72;
              return (
                <div className="flex items-end gap-2 mb-1" style={{ height: 104 }}>
                  {barData.map((d, idx) => {
                    const barH = Math.max(4, Math.round((d.val / maxVal) * BAR_MAX));
                    const isLast = idx === barData.length - 1;
                    return (
                      <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.val}</span>
                        <div className="w-full rounded-t-lg transition-all" style={{ height: barH, background: isLast ? B.violet : B.violetLight }} />
                        <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#F5F3FF]">
              {[
                { label: "Sesiones", value: "12", icon: "✅" },
                {
                  label: "Objetivos",
                  value: "8 / 10",
                  icon: "🎯",
                },
                {
                  label: "Progreso",
                  value: `${child.progress}%`,
                  icon: "📈",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2 rounded-2xl hover:bg-[#F5F3FF] transition-colors cursor-default"
                >
                  <p className="text-lg font-black text-[#1C1135]">
                    {s.icon} {s.value}
                  </p>
                  <p className="text-xs text-[#9E95B7] font-medium">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Crd>

          {/* Therapist-assigned activities */}
          <div
            className="rounded-3xl p-5 border border-[#d1fae5]"
            style={{ background: "rgba(167,243,208,0.22)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#D1FAE5" }}>
                <FileText size={18} style={{ color: "#059669" }} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Actividades asignadas por el terapeuta
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Dra. Ana Ruiz · Terapia del Lenguaje · Complemento educativo
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {recommendations.map((r) => (
                <button
                  key={r.name}
                  onClick={() => go(r.view)}
                  className="rounded-3xl p-4 text-left border border-[#E8E5F4] bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 group"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                    style={{ background: r.bg }}
                  >
                    {r.world}
                  </div>
                  <p className="font-extrabold text-[#1C1135] text-sm mb-1 leading-tight">
                    {r.name}
                  </p>
                  <p
                    className="text-xs font-bold mb-2"
                    style={{ color: r.color }}
                  >
                    {r.reason}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[#9E95B7] font-bold">
                    Explorar <ChevronRight size={11} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Centro de Bienestar */}
          <div
            className="rounded-3xl p-5 border border-[#fed7aa]"
            style={{ background: "rgba(253,186,116,0.18)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">
                  Centro de Bienestar
                </h3>
                <p className="text-xs text-[#9E95B7] font-medium">
                  Recursos y artículos para padres
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {wellnessArticles.map((a) => (
                <button
                  key={a.title}
                  onClick={() => setShowArticle(a)}
                  className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left w-full group active:scale-[.98]"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: a.bg }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[#1C1135] text-sm leading-tight">
                      {a.title}
                    </p>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: a.color }}
                    >
                      {a.time} de lectura
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#C8C2DC] flex-shrink-0 group-hover:text-violet-500 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>);
}
