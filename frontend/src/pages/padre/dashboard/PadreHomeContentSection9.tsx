import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Star, Activity } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

type Props = Pick<ReturnType<typeof usePadreHome>, "go">;
export function PadreHomeContentSection9({ go }: Props) {
return (<div className="grid grid-cols-2 gap-4 mb-6">
          {[
            {
              icon: <Activity size={18} />,
              label: "Racha de participación",
              value: "7 🔥",
              sub: "días seguidos",
              color: "#EF4444",
              bg: "#FEE2E2",
              nav: "mundo-asha/insignias" as View,
              cardBg: "rgba(252,165,165,0.28)",
              note: "No mide progreso clínico",
            },
            {
              icon: <Star size={18} />,
              label: "Tiempo en Mundo ASHA",
              value: "3h 20m",
              sub: "esta semana",
              color: B.orange,
              bg: B.orangeLight,
              nav: "mundo-asha" as View,
              cardBg: "rgba(254,240,138,0.35)",
              note: "No sustituye el tratamiento",
            },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => go(s.nav)}
              className="rounded-3xl border border-[#E8E5F4] shadow-sm shadow-violet-50 p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left active:scale-[.97]"
              style={{ background: s.cardBg }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-[#1C1135] leading-none">
                  {s.value}
                </p>
                <p className="text-xs font-extrabold text-[#7C6F9A] mt-0.5">
                  {s.label}
                </p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {s.sub}
                </p>
                <p className="text-xs font-bold mt-0.5" style={{ color: "#D97706" }}>
                  {s.note}
                </p>
              </div>
            </button>
          ))}
        </div>);
}
