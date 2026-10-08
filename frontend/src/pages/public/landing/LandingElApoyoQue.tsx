import type { useLanding } from "@/pages/public/landing/useLanding";
import { ArrowRight, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";

type Props = Pick<ReturnType<typeof useLanding>, "go">;
export function LandingElApoyoQue({ go }: Props) {
return (<section
        style={{
          background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #1E1148 100%)`,
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: B.violet }}
          />
          <div
            className="absolute top-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: "#9F67FA" }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-5"
            style={{ background: "#DDD6FE" }}
          />
          {/* Dot grid */}
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white opacity-10"
              style={{
                top: 40 + Math.floor(i / 8) * 70,
                left: 40 + (i % 8) * 80,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-7 backdrop-blur-sm border border-white/20">
                <Sparkles size={12} /> Plataforma de apoyo para terapia de lenguaje infantil
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                El apoyo que
                <br />
                tu hijo necesita,
                <br />
                <span style={{ color: "#FCA5A5" }}>
                  en un solo lugar
                </span>
              </h1>
              <p className="text-lg text-violet-200 leading-relaxed mb-9 max-w-md font-medium">
                Conecta con terapeutas certificados, agenda
                sesiones virtuales y acompaña el
                desarrollo de tu hijo desde cualquier lugar.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Btn
                  size="lg"
                  variant="cta"
                  onClick={() => go("login")}
                >
                  Iniciar sesión <ArrowRight size={18} />
                </Btn>
              </div>
              <div className="flex items-center gap-8">
                {[
                  ["🗣️", "Terapia del Lenguaje"],
                  ["🎯", "Sesiones personalizadas"],
                  ["🔒", "Privacidad y acompañamiento"],
                ].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="text-2xl font-black text-white">
                      {val}
                    </p>
                    <p className="text-xs text-violet-300 font-medium">
                      {lbl}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-end items-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z"
              fill={B.bg}
            />
          </svg>
        </div>
      </section>);
}
