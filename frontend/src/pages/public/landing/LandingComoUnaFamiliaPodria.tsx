import type { useLanding } from "@/pages/public/landing/useLanding";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";

type Props = Pick<ReturnType<typeof useLanding>, "testimonials">;
export function LandingComoUnaFamiliaPodria({ testimonials }: Props) {
return (<section
        className="py-20"
        style={{ background: "#F5F3FF" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Bdg color="orange">Historias ilustrativas</Bdg>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black text-[#1C1135] tracking-tight">
              Cómo una familia podría
              <br />
              usar la plataforma
            </h2>
            <p className="mt-3 text-sm text-[#9E95B7] font-medium italic">
              Ejemplos ficticios para el prototipo · No representan casos clínicos reales
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-7 flex flex-col gap-4"
              >
                <p className="text-sm text-[#4B4869] leading-relaxed flex-1 font-medium italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8E5F4]">
                  <Av
                    initials={t.av}
                    color={t.color}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-[#1C1135]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#9E95B7] font-medium">
                      {t.child}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>);
}
