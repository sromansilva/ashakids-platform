import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Video, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Av } from "@/components/common/Av";

type Props = Pick<ReturnType<typeof usePadreHome>, "setShowDetails" | "go">;
export function PadreHomeShowDetails({ setShowDetails, go }: Props) {
return (<div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                Detalles de la sesión
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <Av initials="AR" color={B.violet} size="xl" />
                <div>
                  <p className="font-extrabold text-xl text-[#1C1135]">
                    Dra. Ana Ruiz
                  </p>
                  <p className="text-sm text-[#7C6F9A] font-medium">
                    Terapia del Lenguaje
                  </p>
                </div>
              </div>
              {[
                ["Paciente", "Mateo"],
                ["Fecha", "30 Jul 2026"],
                ["Hora", "10:00 AM"],
                ["Duración", "45 minutos"],
                ["Modalidad", "Virtual"],
                ["Estado", "Confirmada"],
                ["Objetivo", "Pronunciación de la R"],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between py-2.5 border-b border-[#F5F3FF] last:border-0"
                >
                  <span className="text-sm font-bold text-[#9E95B7]">
                    {l}
                  </span>
                  <span className="text-sm font-extrabold text-[#1C1135]">
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex gap-3 mt-5">
                <Btn
                  variant="outline"
                  className="flex-1 justify-center"
                  onClick={() => setShowDetails(false)}
                >
                  Cerrar
                </Btn>
                <Btn
                  variant="cta"
                  className="flex-1 justify-center"
                  onClick={() => {
                    setShowDetails(false);
                    go("session");
                  }}
                >
                  <Video size={14} /> Unirse
                </Btn>
              </div>
            </div>
          </div>
        </div>);
}
