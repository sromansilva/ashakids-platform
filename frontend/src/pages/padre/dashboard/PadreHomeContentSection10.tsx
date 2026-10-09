import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Video, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

type Props = Pick<ReturnType<typeof usePadreHome>, "go">;
export function PadreHomeContentSection10({ go }: Props) {
return (<div className="grid grid-cols-2 gap-4 mb-3">
          {[
            {
              icon: <Video size={18} />,
              label: "Sesiones",
              value: "12",
              sub: "este mes",
              color: B.violet,
              bg: B.violetLight,
              nav: "padre/reportes" as View,
              cardBg: "rgba(147,197,253,0.28)",
            },
            {
              icon: <CheckCircle size={18} />,
              label: "Objetivos terapéuticos",
              value: "8/10",
              sub: "informados por terapeuta",
              color: B.teal,
              bg: B.tealLight,
              nav: "padre/reportes" as View,
              cardBg: "rgba(167,243,208,0.32)",
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
              </div>
            </button>
          ))}
        </div>);
}
