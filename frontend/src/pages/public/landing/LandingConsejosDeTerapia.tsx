import type { useLanding } from "@/pages/public/landing/useLanding";
import { Mail } from "lucide-react";
import { B } from "@/theme/brand/B";

type Props = Pick<ReturnType<typeof useLanding>, "email" | "setEmail">;
export function LandingConsejosDeTerapia({ email, setEmail }: Props) {
return (<section className="py-20" style={{ background: B.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="relative rounded-3xl overflow-hidden px-8 sm:px-16 py-14 text-center text-white"
            style={{
              background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #6D28D9 100%)`,
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, #A78BFA, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"
              style={{
                background:
                  "radial-gradient(circle, #7C3AED, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-extrabold"
                style={{
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
              >
                ✉️ Newsletter semanal · Gratis
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight leading-tight">
                Consejos de terapia
                <br />
                directamente en tu correo
              </h2>
              <p
                className="mb-8 max-w-md mx-auto leading-relaxed font-medium text-sm"
                style={{ color: "rgba(196,181,253,.9)" }}
              >
                Cada semana, ejercicios y tips de nuestros
                especialistas para estimular el desarrollo de tu
                hijo en casa.
              </p>

              {/* Input row — high contrast */}
              <div className="max-w-lg mx-auto">
                <div
                  className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,.15)",
                    border: "1.5px solid rgba(255,255,255,.3)",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 bg-white rounded-xl px-4 py-3">
                    <Mail
                      size={16}
                      className="text-[#9E95B7] flex-shrink-0"
                    />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="peer flex-1 bg-transparent text-sm font-bold text-[#1C1135] placeholder:text-[#9E95B7] caret-[#EA580C] focus:outline-none"
                    />
                    <span aria-hidden="true" className="hidden h-5 w-0.5 rounded-full bg-[#EA580C] animate-pulse peer-focus:block" />
                  </div>
                  <button
                    className="rounded-xl px-6 py-3 font-extrabold text-sm whitespace-nowrap transition-all hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${B.orange}, #EA580C)`,
                      color: "white",
                    }}
                  >
                    Suscribirme gratis
                  </button>
                </div>
                <p
                  className="text-xs mt-3 font-medium"
                  style={{ color: "rgba(196,181,253,.6)" }}
                >
                  Sin spam. Cancela cuando quieras. Solo información relevante sobre terapia de lenguaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>);
}
