import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Star, X, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreHome>, "setShowArticle" | "showArticle" | "go">;
export function PadreHomeShowArticle({ setShowArticle, showArticle, go }: Props) {
return (<div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowArticle(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                {showArticle.title}
              </h2>
              <button
                onClick={() => setShowArticle(null)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: B.violetLight,
                    color: B.violet,
                  }}
                >
                  {showArticle.time} de lectura
                </span>
                <span className="text-xs text-[#9E95B7] font-medium">
                  Por el equipo de ASHI · Centro de Bienestar
                </span>
              </div>
              <p className="text-sm text-[#1C1135] font-medium leading-relaxed mb-4">
                El bienestar de tu hijo es una prioridad. Este
                artículo fue preparado por nuestro equipo
                clínico para ayudarte a complementar el trabajo
                terapéutico desde casa.
              </p>
              <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-4">
                Las sesiones de terapia son fundamentales, pero
                el progreso más significativo ocurre cuando los
                aprendizajes se refuerzan en el hogar. Pequeñas
                rutinas diarias pueden marcar una gran
                diferencia en el desarrollo de tu hijo.
              </p>
              <div
                className="rounded-2xl p-4 mb-5"
                style={{ background: B.violetLight }}
              >
                <p
                  className="text-xs font-extrabold uppercase tracking-wider mb-2"
                  style={{ color: B.violet }}
                >
                  Orientación de navegación · ASHI
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Dedica tiempo a las actividades asignadas por el terapeuta",
                    "Consulta con el terapeuta cualquier duda sobre el avance",
                    "El progreso clínico lo interpreta únicamente el terapeuta",
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm font-medium text-[#1C1135]"
                    >
                      <CheckCircle
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: B.teal }}
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <Btn
                variant="secondary"
                className="w-full justify-center"
                onClick={() => {
                  setShowArticle(null);
                  go("mundo-asha");
                }}
              >
                <Star size={14} /> Explorar actividades
                relacionadas
              </Btn>
            </div>
          </div>
        </div>);
}
