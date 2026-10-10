import { useState, useRef, useEffect } from "react";
import { Video, X, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Role } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";
import { MobileTopBar } from "@/components/common/MobileTopBar";
import { Sidebar } from "@/app/layouts/Sidebar";
import { AshhiFloat } from "@/components/assistant/AshhiFloat";
import { useAuth } from '@/hooks/useAuth';
import "@/pages/admin/admin.css";
import { NotificationCenter } from '@/components/common/NotificationCenter';

export function DashLayout({
  role,
  cur,
  go,
  logout,
  children,
  title,
  padreUserName = "Laura Gómez",
  padrePlan = "exploracion",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  children: React.ReactNode;
  title: string;
  padreUserName?: string;
  padrePlan?: "exploracion" | "familia";
}) {
  const [mob, setMob] = useState(false);
  const { user } = useAuth();
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = () => { setMob(false); requestAnimationFrame(() => mobileMenuButton.current?.focus()); };
  useEffect(() => {
    if (!mob) return;
    const previousOverflow = document.body.style.overflow;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeMobileMenu(); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onEscape); };
  }, [mob]);
  return (
    <div
      className={`flex h-screen overflow-hidden${role === "admin" ? " asha-admin" : ""}`}
      style={{
        background: B.bg,
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      <Sidebar role={role} cur={cur} go={go} logout={logout} padreUserName={padreUserName} padrePlan={padrePlan} />

      {mob && (
        <div className="md:hidden fixed inset-0 z-40 flex bg-black/50 backdrop-blur-sm">
          <div className={`w-[84vw] max-w-none h-[100dvh] flex flex-col bg-white shadow-2xl flex-shrink-0 animate-in slide-in-from-left duration-200${role === "padre" ? " family-sidebar" : ""}`} style={{ position: "relative", isolation: "isolate", paddingTop: "max(59px, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center gap-2">
                <Isotipo size={38} />
                <span className="font-extrabold text-[#1C1135] text-sm">
                  AshaKids
                </span>
              </div>
              <button
                aria-label="Cerrar menú de navegación"
                onClick={closeMobileMenu}
                className="w-11 h-11 flex items-center justify-center hover:bg-violet-50 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <Sidebar
              role={role}
              cur={cur}
              go={(v) => {
                go(v);
                closeMobileMenu();
              }}
              logout={logout}
              mobile
              padreUserName={padreUserName}
              padrePlan={padrePlan}
            />
          </div>
          <div
            className="flex-1"
            onClick={closeMobileMenu}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {role === 'admin' && <div className="admin-toolbar"><p>{title}</p><span>{user?.nombres} {user?.apellidos}<span>Administración</span></span></div>}
        <MobileTopBar title={title} onMenu={() => setMob(true)} menuOpen={mob} />
        <div className="flex-1 overflow-y-auto flex min-h-0">
          <div className={`flex-1 min-w-0 overflow-x-hidden${role === "admin" ? " admin-content" : ""}`}>
            {role === 'terapeuta' && <NotificationCenter key={user?.id_usuario} go={go}/>}
            {children}
          </div>

          {/* ── Right context panel (kept for xl screens without role sidebar) ── */}
          {false && (
            <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 border-l border-[#E8E5F4] bg-white overflow-y-auto p-5 gap-5">
              {/* Próxima sesión */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  Próxima sesión
                </p>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${B.violetDeep}, #4C1D95)`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Video size={14} color="white" />
                    <span className="text-xs font-bold text-white/80">
                      ASHA Session · Virtual
                    </span>
                  </div>
                  <p className="font-extrabold text-white text-sm mb-0.5">
                    {role === "terapeuta"
                      ? "Bruno Ríos"
                      : role === "admin"
                        ? "Revisión Q3"
                        : "Dra. Ana Ruiz"}
                  </p>
                  <p className="text-xs text-white/70 font-medium mb-3">
                    Mañana · 09:00 AM
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        go(
                          role === "terapeuta"
                            ? "terapeuta/agenda"
                            : role === "admin"
                              ? "admin/citas"
                              : "padre/agenda",
                        )
                      }
                      className="flex-1 rounded-xl py-1.5 text-xs font-extrabold text-white border border-white/30 hover:bg-white/10 active:scale-[.97] transition-all"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => go("session")}
                      className="flex-1 rounded-xl py-1.5 text-xs font-extrabold bg-white hover:bg-white/90 active:scale-[.97] transition-all"
                      style={{ color: B.violet }}
                    >
                      Unirse
                    </button>
                  </div>
                </div>
              </div>

              {/* Actividad reciente */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  Actividad reciente
                </p>
                <div className="flex flex-col gap-2">
                  {(role === "admin"
                    ? [
                        {
                          icon: "👤",
                          text: "Nuevo terapeuta verificado",
                          time: "Hace 12 min",
                          color: B.teal,
                        },
                        {
                          icon: "💳",
                          text: "Pago procesado — $65.00",
                          time: "Hace 28 min",
                          color: B.success,
                        },
                        {
                          icon: "📅",
                          text: "Cita agendada — Sesión #25",
                          time: "Hace 1h",
                          color: B.violet,
                        },
                        {
                          icon: "⚠️",
                          text: "Reporte de moderación nuevo",
                          time: "Hace 2h",
                          color: B.warning,
                        },
                      ]
                    : role === "terapeuta"
                      ? [
                          {
                            icon: "📝",
                            text: "Reporte de Mateo enviado",
                            time: "Hace 5 min",
                            color: B.violet,
                          },
                          {
                            icon: "📅",
                            text: "Bruno agenda cita nueva",
                            time: "Hace 22 min",
                            color: B.teal,
                          },
                          {
                            icon: "💬",
                            text: "Mensaje de Laura Gómez",
                            time: "Hace 1h",
                            color: B.orange,
                          },
                          {
                            icon: "⭐",
                            text: "Nueva valoración 5★",
                            time: "Hace 3h",
                            color: "#F59E0B",
                          },
                        ]
                      : [
                          {
                            icon: "✅",
                            text: "Sesión #24 completada",
                            time: "Hace 2 días",
                            color: B.success,
                          },
                          {
                            icon: "📄",
                            text: "Nuevo reporte disponible",
                            time: "Hace 2 días",
                            color: B.violet,
                          },
                          {
                            icon: "🎮",
                            text: "Mateo ganó 50 XP en Mundo ASHA",
                            time: "Hace 3 días",
                            color: B.orange,
                          },
                          {
                            icon: "📅",
                            text: "Cita confirmada para mañana",
                            time: "Hace 4 días",
                            color: B.teal,
                          },
                        ]
                  ).map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-violet-50/60 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${a.color}18` }}
                      >
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1C1135] leading-snug">
                          {a.text}
                        </p>
                        <p className="text-xs text-[#9E95B7] font-medium">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats rápidas */}
              <div>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">
                  {role === "admin"
                    ? "Hoy en la plataforma"
                    : role === "terapeuta"
                      ? "Tu semana"
                      : "Progreso de Mateo"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(role === "admin"
                    ? [
                        { v: "18", l: "Sesiones", c: B.violet },
                        { v: "3", l: "Nuevos", c: B.teal },
                        { v: "98%", l: "Uptime", c: B.orange },
                        { v: "—", l: "Pagos", c: B.success },
                      ]
                    : role === "terapeuta"
                      ? [
                          {
                            v: "6",
                            l: "Sesiones",
                            c: B.violet,
                          },
                          {
                            v: "4.9★",
                            l: "Valoración",
                            c: "#F59E0B",
                          },
                          {
                            v: "12",
                            l: "Pacientes",
                            c: B.teal,
                          },
                          {
                            v: "—",
                            l: "Pagos",
                            c: B.success,
                          },
                        ]
                      : [
                          {
                            v: "78%",
                            l: "Progreso",
                            c: B.violet,
                          },
                          { v: "24", l: "Sesiones", c: B.teal },
                          {
                            v: "4.9★",
                            l: "Terapeuta",
                            c: "#F59E0B",
                          },
                          {
                            v: "320",
                            l: "XP ganados",
                            c: B.orange,
                          },
                        ]
                  ).map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl p-3 text-center border border-[#E8E5F4]"
                    >
                      <p
                        className="text-base font-black"
                        style={{ color: s.c }}
                      >
                        {s.v}
                      </p>
                      <p className="text-xs text-[#9E95B7] font-medium">
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASHI sugerencia */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,.2)",
                    }}
                  >
                    <Sparkles size={11} color="white" />
                  </div>
                  <span className="text-xs font-extrabold text-white">
                    ASHI sugiere
                  </span>
                </div>
                <p
                  className="text-xs font-medium leading-relaxed"
                  style={{ color: "rgba(255,255,255,.8)" }}
                >
                  {role === "admin"
                    ? "Los lunes registran más cancelaciones. Considera enviar recordatorios el domingo por la tarde."
                    : role === "terapeuta"
                      ? "Bruno lleva 2 semanas sin sesión. Un mensaje de seguimiento podría ayudar a retomarlo."
                      : "Mateo tiene 3 actividades nuevas en Mundo ASHA recomendadas por la Dra. Ana. ¡Pruébenlas juntos!"}
                </p>
              </div>
            </aside>
          )}
        </div>
      </main>
      {role === 'admin' && <div className="admin-support-rail">Ayuda y asistente</div>}
      <AshhiFloat key={user?.id_usuario ?? 'guest'} role={role} />
    </div>
  );
}
