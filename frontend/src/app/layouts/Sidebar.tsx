import { Home, Calendar, MessageCircle, Users, Star, LogOut, FileText, BarChart2, Activity, UserPlus, Stethoscope, Settings, Shield, Cpu, AlertTriangle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Role } from "@/types/navigation";
import { Av } from "@/components/common/Av";
import { Isotipo } from "@/components/illustrations/Isotipo";

export function Sidebar({
  role,
  cur,
  go,
  logout,
  mobile = false,
  padreUserName = "Laura Gómez",
  padrePlan = "exploracion",
}: {
  role: Role;
  cur: View;
  go: (v: View) => void;
  logout: () => void;
  mobile?: boolean;
  padreUserName?: string;
  padrePlan?: "exploracion" | "familia";
}) {
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
              icon: Stethoscope,
              label: "Terapeutas",
              view: "admin/terapeutas" as View,
            },
            {
              icon: Activity,
              label: "Operación",
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
            name: "Dra. Ana Ruiz",
            sub: "Terapeuta",
            av: "AR",
            color: B.teal,
          }
        : {
            name: "Administrador",
            sub: "Admin",
            av: "AD",
            color: B.orange,
          };

  return (
    <aside
      className={`${mobile ? "flex flex-1 min-h-0 w-full static" : "hidden md:flex h-screen sticky top-0 border-r border-[#E8E5F4]"} flex-col bg-white overflow-y-auto flex-shrink-0${role === "padre" ? " family-sidebar" : ""}`}
      style={{ width: mobile ? "100%" : 240 }}
    >
      {!mobile && <div className="p-5 pb-4" style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-2.5"><Isotipo size={36} /><span className="font-extrabold text-[#1C1135] text-lg tracking-tight">AshaKids</span></div>
      </div>}

      <nav className={`flex-1 min-h-0 overflow-y-auto py-2 flex flex-col gap-0.5 px-3`} style={{ position: "relative", zIndex: 1 }}>
        {nav.map((item) => {
          const active = cur === item.view || (item.view === "admin/dashboard" && cur === "admin");
          return (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-150 w-full text-left active:scale-[.98]
                ${
                  active
                    ? "bg-violet-700 text-white shadow-sm shadow-violet-200"
                    : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"
                }`}
            >
              <item.icon
                size={17}
                className={`flex-shrink-0 transition-colors ${active ? "text-white" : "text-[#9E95B7]"}`}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`shrink-0 px-4 py-4 ${mobile ? "pb-[calc(1rem+env(safe-area-inset-bottom))]" : ""}`} style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-3 min-w-0">
          <Av initials={user.av} color={user.color} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1C1135] leading-snug truncate">{user.name}</p>
            {user.sub && <p className="text-xs font-extrabold truncate" style={{ color: user.color }}>{user.sub}</p>}
          </div>
          <button onClick={logout} className="shrink-0 h-11 px-3 inline-flex items-center gap-1.5 rounded-xl text-sm text-[#7C6F9A] hover:bg-red-50 hover:text-red-500 transition-colors font-medium" aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
