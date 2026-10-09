import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { X, RefreshCw } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreHome>, "setShowReprog" | "setHomeToast">;
export function PadreHomeShowReprog({ setShowReprog, setHomeToast }: Props) {
return (<div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReprog(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                Reprogramar sesión
              </h2>
              <button
                onClick={() => setShowReprog(false)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                Selecciona una nueva fecha para tu sesión con{" "}
                <strong className="text-[#1C1135]">
                  Dra. Ana Ruiz
                </strong>
                .
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  "Mar 5 Ago · 09:00",
                  "Mié 6 Ago · 10:00",
                  "Jue 7 Ago · 11:00",
                  "Vie 8 Ago · 14:00",
                ].map((d) => (
                  <button
                    key={d}
                    className="py-3 rounded-2xl border-2 text-sm font-bold transition-all hover:border-violet-400 hover:bg-violet-50"
                    style={{ borderColor: B.border }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Btn
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setShowReprog(false);
                  setHomeToast(
                    "Sesión reprogramada exitosamente",
                  );
                }}
              >
                <RefreshCw size={14} /> Confirmar reprogramación
              </Btn>
            </div>
          </div>
        </div>);
}
