import type { useLanding } from "@/pages/public/landing/useLanding";
import { ChevronRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Bdg } from "@/components/common/Bdg";

type Props = Pick<ReturnType<typeof useLanding>, "services" | "go">;
export function LandingTerapiasEspecializadas({ services, go }: Props) {
return (<section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Bdg color="violet">Nuestros Servicios</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight leading-tight">
              Terapias especializadas
              <br />
              para cada niño
            </h2>
            <p className="mt-4 text-[#7C6F9A] max-w-xl mx-auto leading-relaxed font-medium">
              Cada niño es único. Nuestros especialistas diseñan
              planes personalizados para potenciar las
              fortalezas de tu hijo.
            </p>
          </div>
          <div>
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-3xl border border-[#E8E5F4] p-8 sm:p-10"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ backgroundColor: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1C1135]">
                    {s.title}
                  </h3>
                </div>
                <p className="text-base text-[#7C6F9A] leading-relaxed font-medium mb-6 max-w-3xl">
                  {s.desc}
                </p>
                <Btn
                  variant="cta"
                  onClick={() => go("login")}
                >
                  Iniciar sesión <ChevronRight size={15} />
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>);
}
