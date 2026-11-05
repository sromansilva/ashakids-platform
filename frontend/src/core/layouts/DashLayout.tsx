import { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { X, Stethoscope, UserRound, LogOut } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import { View } from "@/shared/domain/types/navigation";
import { Role } from "@/shared/domain/types/navigation";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";
import { MobileTopBar } from "@/shared/presentation/components/common/MobileTopBar";
import { Sidebar } from "@/core/layouts/Sidebar";
import { FamilySidebar } from "@/core/layouts/FamilySidebar";
import { FamilyTopNav } from "@/modules/padre/presentation/dashboard/FamilyTopNav";
import { AshhiFloat } from "@/shared/presentation/components/assistant/AshhiFloat";
import { useAuth } from '@/modules/auth/application/useAuth';
import "@/modules/admin/presentation/admin.css";
import "@/modules/padre/presentation/family.css";
import "@/modules/terapeuta/presentation/therapist.css";
import { NotificationCenter } from '@/shared/presentation/components/common/NotificationCenter';
import { FirstIntroductorySessionModal } from '@/shared/presentation/components/common/FirstIntroductorySessionModal';

export function DashLayout({
  role,
  cur,
  go,
  logout,
  children,
  title,
  padreUserName = "Laura Gómez",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  children: React.ReactNode;
  title: string;
  padreUserName?: string;
}) {
  const [mob, setMob] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isFamily = role === 'padre';
  const familySidebarClass = role === 'padre' ? ' family-sidebar' : '';
  const isWelcome = isFamily && (location.pathname === '/padre/welcome' || cur === ('padre/welcome' as View));
  const currentSection = searchParams.get('section');
  const isFamilyContextual = isFamily && !isWelcome && (
    (location.pathname === '/padre' && currentSection === 'family') ||
    location.pathname.startsWith('/padre/agenda') ||
    location.pathname.startsWith('/padre/mensajes') ||
    location.pathname.startsWith('/padre/psicologos') ||
    location.pathname.startsWith('/padre/reportes') ||
    location.pathname.startsWith('/padre/config') ||
    location.pathname.startsWith('/padre/perfil') ||
    location.pathname.startsWith('/padre/incidencias')
  );
  const childCenter = isFamily && (cur === 'padre' || isWelcome);
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
      className={`flex h-screen overflow-hidden${isFamily ? " flex-col" : " flex-row"}${role === "admin" ? " asha-admin" : role === "padre" ? " asha-family" : role === "terapeuta" ? " asha-professional" : ""}${isFamily ? ' family-center-layout' : ''}`}
      style={{
        background: B.bg,
        fontFamily: '"Nunito", system-ui, sans-serif',
      }}
    >
      {!isFamily && <Sidebar role={role} cur={cur} go={go} logout={logout} collapsed={role === "terapeuta" || role === "admin"} hideUserFooter={role === "terapeuta" || role === "admin"} padreUserName={padreUserName} />}

      {mob && !isFamily && (
        <div className="md:hidden fixed inset-0 z-40 flex bg-black/50 backdrop-blur-sm">
          <div className={`w-[84vw] max-w-none h-[100dvh] flex flex-col bg-white shadow-2xl flex-shrink-0 animate-in slide-in-from-left duration-200${familySidebarClass}`} style={{ position: "relative", isolation: "isolate", paddingTop: "max(59px, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}>
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
            />
          </div>
          <div
            className="flex-1"
            onClick={closeMobileMenu}
          />
        </div>
      )}

      {isFamily && <FamilyTopNav cur={cur} go={go} logout={logout} padreUserName={padreUserName} />}

      <div className={isFamily ? "flex flex-1 min-h-0 overflow-hidden" : "contents"}>
      {isFamily && isFamilyContextual && <FamilySidebar go={go} />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {role === "admin" && (
          <header className="flex items-center justify-between px-6 sm:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-[#E8E5F4] shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-sm font-bold text-[#625779]">
              <span className="text-[#1C1135]">Inicio</span>
              {cur !== "admin" &&
                cur !== "admin/dashboard" && (
                  <>
                    <span className="text-[#9E95B7]">›</span>
                    <span className="text-[#1C1135] font-extrabold capitalize">
                      {cur.replace("admin/", "").replace("operacion", "incidencias").replace("ml", "machine learning")}
                    </span>
                  </>
                )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#E8E5F4] bg-white px-2 py-1.5 shadow-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F2EDFF] text-[#6B46FE]">
                  <UserRound size={17} />
                </span>
                <div className="min-w-0 max-w-[180px]">
                  <p className="truncate text-xs sm:text-sm font-extrabold text-[#1C1135] leading-tight">
                    {user?.nombres
                      ? `${user.nombres} ${user.apellidos || ""}`
                      : "Administrador Sistema"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold leading-tight text-[#7E6AA5]">
                    Administración
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-extrabold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          </header>
        )}
        {role === "terapeuta" && (
          <header aria-label="Barra superior del terapeuta" className="hidden md:flex h-[72px] shrink-0 items-center justify-between gap-6 border-b border-[#E8E5F4] bg-white/90 px-6 backdrop-blur-xl lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 text-[#6B46FE] ring-1 ring-violet-100">
                <Stethoscope size={18} />
              </span>
              {cur === "terapeuta/reportes" ? (
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9E95B7]">Espacio profesional</p>
                  <h1 className="mt-0.5 truncate text-sm font-black text-[#1C1135]">Reportes clínicos</h1>
                </div>
              ) : cur === "terapeuta/mensajes" ? (
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9E95B7]">Comunicación familiar</p>
                  <h1 className="mt-0.5 truncate text-base font-black text-[#1C1135]">Mensajes</h1>
                </div>
              ) : (
                <p className="truncate text-sm font-extrabold text-[#1C1135]">
                  {cur === "terapeuta" ? "Panel del terapeuta" : "Espacio profesional"}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <NotificationCenter go={go} />
              <span aria-hidden="true" className="mx-1 h-8 w-px bg-[#E8E5F4]" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#E8E5F4] bg-white px-2 py-1.5 shadow-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F2EDFF] text-[#6B46FE]">
                    <UserRound size={17} />
                  </span>
                  <div className="min-w-0 max-w-[180px]">
                    <p className="truncate text-xs font-extrabold leading-tight text-[#1C1135]">
                      {user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Terapeuta"}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold leading-tight text-[#7E6AA5]">Terapeuta</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                  className="flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-sm font-extrabold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                >
                  <LogOut size={16} />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </header>
        )}
        {!isFamily && <MobileTopBar title={title} onMenu={() => setMob(true)} menuOpen={mob} />}
        <div className="flex-1 overflow-y-auto flex min-h-0">
          <div className={`flex-1 min-w-0 overflow-x-hidden${role === "admin" ? " admin-content" : role === "padre" ? " family-content" : role === "terapeuta" ? " professional-content" : ""}`}>
            {children}
          </div>


        </div>
      </main>
      </div>
      {role === 'admin' && <div className="admin-support-rail">Ayuda y asistente</div>}
      {!childCenter && role !== "admin" && <AshhiFloat key={user?.id_usuario ?? 'guest'} role={role} />}
      {isFamily && <FirstIntroductorySessionModal go={go} />}
    </div>
  );
}
