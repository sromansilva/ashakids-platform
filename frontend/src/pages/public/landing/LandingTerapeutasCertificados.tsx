import type { useLanding } from "@/pages/public/landing/useLanding";
import { ArrowRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { therapists } from "@/mocks/demo";

type Props = Pick<ReturnType<typeof useLanding>, "go">;
export function LandingTerapeutasCertificados({ go }: Props) {
return (<section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <Bdg color="teal">Nuestro Equipo</Bdg>
              <h2 className="mt-3 text-3xl font-black text-[#1C1135] tracking-tight leading-tight">
                Terapeutas certificados
                <br />y comprometidos
              </h2>
            </div>
            <Btn
              variant="outline"
              onClick={() => go("login")}
              className="hidden md:inline-flex"
            >
              Ver todos <ArrowRight size={14} />
            </Btn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
            {therapists.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Av
                      initials={t.av}
                      color={t.color}
                      size="lg"
                    />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${t.available ? "bg-emerald-400" : "bg-slate-300"}`}
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#1C1135]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#7C6F9A] font-medium">
                      {t.specialty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-5">
                  {t.tags.map((tag) => (
                    <Bdg key={tag} color="violet">
                      {tag}
                    </Bdg>
                  ))}
                  <Bdg color="gray">{t.experience}</Bdg>
                </div>
                <div className="flex items-center justify-end">
                  <Btn
                    size="sm"
                    variant={
                      t.available ? "primary" : "outline"
                    }
                    disabled={!t.available}
                    onClick={() => go("login")}
                  >
                    {t.available ? "Agendar" : "No disponible"}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>);
}
