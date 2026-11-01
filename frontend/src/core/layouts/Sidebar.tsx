import { useState } from "react";
import { Home, Calendar, MessageCircle, Users, Star, LogOut, FileText, BarChart2, Activity, UserPlus, Settings, Shield, Cpu, AlertTriangle } from "lucide-react";
import { B } from "@/shared/presentation/theme/brand/B";
import { View } from "@/shared/domain/types/navigation";
import { Role } from "@/shared/domain/types/navigation";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";

export function Sidebar({
  role,
  cur,
  go,
  logout,
  mobile = false,
  collapsed = false,
  hideUserFooter = false,
  padreUserName = "Laura Gómez",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  mobile?: boolean;
  collapsed?: boolean;
  hideUserFooter?: boolean;
  padreUserName?: string;
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const nav =
    role === "padre"
      ? [
          {
            icon: Home,
            label: "Centro Familiar",
            view: "padre" as View,
          },
          {
            icon: Users,
            label: "Mi Camino ASHA",
            view: "padre/camino" as View,
          },
          {
            icon: Calendar,
            label: "Agenda y sesiones",
            view: "padre/agenda" as View,
          },
          {
            icon: UserPlus,
            label: "Terapeutas",
            view: "padre/psicologos" as View,
          },
          {
            icon: MessageCircle,
            label: "Mensajes",
            view: "padre/mensajes" as View,
          },
          {
            icon: FileText,
            label: "Reportes",
            view: "padre/reportes" as View,
          },
          {
            icon: Star,
            label: "Mundo ASHA",
            view: "mundo-asha" as View,
          },
          {
            icon: Settings,
            label: "Configuración",
            view: "padre/config" as View,
          },
          {
            icon: AlertTriangle,
            label: "Incidencias",
            view: "padre/incidencias" as View,
          },
        ]
      : role === "terapeuta"
        ? [
            {
              icon: Home,
              label: "Inicio",
              view: "terapeuta" as View,
            },
            {
              icon: Users,
              label: "Pacientes",
              view: "terapeuta/pacientes" as View,
            },
            {
              icon: Calendar,
              label: "Agenda",
              view: "terapeuta/agenda" as View,
            },
            {
              icon: FileText,
              label: "Reportes",
              view: "terapeuta/reportes" as View,
            },
            {
              icon: BarChart2,
              label: "Analíticas",
              view: "terapeuta/analiticas" as View,
            },
            {
              icon: MessageCircle,
              label: "Mensajes",
              view: "terapeuta/mensajes" as View,
            },
            {
              icon: Star,
              label: "Valoraciones",
              view: "terapeuta/valoraciones" as View,
            },
            {
              icon: Activity,
              label: "Datos de actividad",
              view: "terapeuta/datos-actividad" as View,
            },
            {
              icon: Settings,
              label: "Configuración",
              view: "terapeuta/config" as View,
            },
            {
              icon: AlertTriangle,
              label: "Incidencias",
              view: "terapeuta/incidencias" as View,
            },
          ]
        : [
            {
              icon: BarChart2,
              label: "Dashboard",
              view: "admin/dashboard" as View,
            },
            {
              icon: Users,
              label: "Cuentas",
              view: "admin/cuentas" as View,
            },
            {
              icon: Activity,
              label: "Incidencias",
              view: "admin/operacion" as View,
            },
            {
              icon: Star,
              label: "Contenido",
              view: "admin/contenido" as View,
            },
            {
              icon: Cpu,
              label: "Machine Learning",
              view: "admin/ml" as View,
            },
            {
              icon: Shield,
              label: "Auditoría y seguridad",
              view: "admin/auditoria" as View,
            },
            {
              icon: Settings,
              label: "Configuración",
              view: "admin/config" as View,
            },
          ];

  const user =
    role === "padre"
      ? {
          name: padreUserName,
          sub: "",
          av: padreUserName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          color: B.violet,
        }
      : role === "terapeuta"
        ? {
            name: padreUserName,
            sub: "Terapeuta",
            av: padreUserName.slice(0, 2).toUpperCase(),
            color: B.teal,
          }
        : {
            name: "Administrador Sistema",
            sub: "Admin",
            av: "AD",
            color: "#FF8A00",
          };

  return (
    <aside
      className={`${mobile ? "flex flex-1 min-h-0 w-full static" : "hidden md:flex h-screen sticky top-0 border-r border-[#E8E5F4]"} flex-col bg-white overflow-y-auto flex-shrink-0${role === "padre" ? " family-sidebar" : role === "admin" ? " admin-sidebar" : ""}${collapsed ? " sidebar--collapsed" : ""}`}
      style={{ width: mobile ? "100%" : collapsed ? 88 : 240 }}
    >
      {!mobile && <div className={`p-5 pb-4 ${collapsed ? "sidebar-brand-collapsed" : ""}`} style={{ position: "relative", zIndex: 1 }}>
        <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}><Isotipo size={36} /><span className={`sidebar-brand-label ${collapsed ? "sidebar-brand-label--collapsed" : ""} font-extrabold text-[#1C1135] text-lg tracking-tight`}>AshaKids</span></div>
      </div>}

      <nav className={`flex-1 min-h-0 overflow-y-auto py-2 flex flex-col gap-1 px-3`} style={{ position: "relative", zIndex: 1 }}>
        {nav.map((item) => {
          const active =
            cur === item.view ||
            (item.view === "admin/dashboard" && (cur === "admin" || cur === "admin/dashboard")) ||
            (item.view === "admin/operacion" && ((cur as string) === "admin/incidencias" || cur === "admin/operacion"));
          return (
            <button
              key={item.view}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              onClick={() => go(item.view)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 w-full text-left active:scale-[.98] ${collapsed ? "justify-center gap-0 px-0" : ""}
                ${
                  active
                    ? "bg-[#6B46FE] text-white shadow-md shadow-violet-200"
                    : "text-[#5C5378] hover:bg-violet-50 hover:text-[#6B46FE]"
                }`}
            >
              <item.icon
                size={collapsed ? 22 : 18}
                className={`sidebar-nav-icon flex-shrink-0 transition-colors ${active ? "text-white" : "text-[#7C6F9A]"}`}
                aria-hidden="true"
              />
              <span className={`sidebar-nav-label ${collapsed ? "sidebar-nav-label--collapsed" : "truncate"}`}>{item.label}</span>
              {active && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {!hideUserFooter && <div className={`shrink-0 px-4 py-4 border-t border-[#E8E5F4] ${mobile ? "pb-[calc(1rem+env(safe-area-inset-bottom))]" : ""} ${collapsed ? "sidebar-user-footer-collapsed" : ""}`} style={{ position: "relative", zIndex: 1 }}>
        {showLogoutConfirm ? (
          <div className={`sidebar-logout-confirm flex items-center justify-between gap-2 p-2 rounded-2xl bg-red-50 border border-red-200 animate-in fade-in duration-150`}>
            <span className="text-xs font-bold text-red-700 truncate">¿Cerrar sesión?</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors cursor-pointer"
                title="Confirmar cierre"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-gray-100 text-[#615274] border border-[#E8E5F4] font-bold text-xs transition-colors cursor-pointer"
                title="Cancelar"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className={`sidebar-user-row flex items-center gap-3 min-w-0 ${collapsed ? "sidebar-user-row-collapsed" : ""}`}>
            <div title={collapsed ? user.name : undefined} className={`sidebar-user-avatar ${collapsed ? "w-9 h-9" : "w-10 h-10"} rounded-full bg-[#FF8A00] flex items-center justify-center text-white font-extrabold text-sm shrink-0`}>
              {user.av}
            </div>
            <div className={`sidebar-user-copy flex-1 min-w-0 ${collapsed ? "sidebar-user-copy--collapsed" : ""}`}>
              <p className="text-sm font-bold text-[#1C1135] leading-snug truncate">{user.name}</p>
              {user.sub && <p className="text-xs font-black truncate text-[#FF8A00]">{user.sub}</p>}
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className={`sidebar-logout-button ${collapsed ? "h-9 w-9" : "h-10 w-10"} shrink-0 flex items-center justify-center rounded-xl text-[#7C6F9A] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer`}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>}
    </aside>
  );
}
