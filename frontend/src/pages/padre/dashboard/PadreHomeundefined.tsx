import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Video, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Ashi } from "@/components/illustrations/Ashi";

type Props = Pick<ReturnType<typeof usePadreHome>, "padreUserName" | "child" | "go">;
export function PadreHomeundefined({ padreUserName, child, go }: Props) {
return (<div
          className="relative rounded-3xl overflow-hidden p-6 sm:p-8 mb-6"
          style={{
            background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 55%, #5B21B6 100%)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute top-3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="absolute bottom-5 right-1/4 w-2.5 h-2.5 rounded-full bg-orange-300/30" />
            <div className="absolute top-8 right-20 text-white/15 text-sm select-none">
              ✦
            </div>
            <div className="absolute bottom-8 right-56 text-white/10 text-xs select-none">
              ✦
            </div>
            <div className="absolute top-16 right-72 text-white/10 text-xs select-none">
              ✦
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-violet-300 text-sm font-bold mb-1.5">
                ¡Hola, {padreUserName.split(" ")[0]}! 🌈
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                {child.name} tiene nuevas
                <br className="hidden sm:block" /> actividades
                para hoy
              </h2>
              <p className="text-violet-200 text-sm mb-5 font-medium max-w-sm">
                Gestiona la terapia, sigue el progreso y explora
                actividades asignadas por el terapeuta.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Btn
                  variant="cta"
                  onClick={() => go("session")}
                >
                  <Video size={15} /> Ir a sesión
                </Btn>
                <button
                  onClick={() => go("padre/recorrido")}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white/75 hover:text-white transition-colors"
                >
                  <CheckCircle size={15} /> Mi Camino ASHA
                </button>
              </div>
            </div>
            <div className="hidden sm:flex flex-shrink-0 items-end">
              <Ashi size={110} mood="wave" />
            </div>
          </div>
        </div>);
}
