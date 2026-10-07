import React from "react";
import {
  Globe,
  Heart,
  Stethoscope,
  BarChart2,
  Cpu,
  Server,
  Database,
  Search,
  Bell,
} from "lucide-react";
import { B } from "@/components/shared";

// ─── ASHA Core ────────────────────────────────────────────────────────────────

export function AshaCore() {
  const coreStyles = `
    @keyframes asha-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
    @keyframes asha-flow  { 0%{transform:translateY(-8px);opacity:0} 40%{opacity:1} 100%{transform:translateY(48px);opacity:0} }
    @keyframes asha-scan  { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
    @keyframes asha-glow  { 0%,100%{opacity:.4} 50%{opacity:1} }
    @keyframes asha-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .core-pulse { animation: asha-pulse 2s ease-in-out infinite; }
    .core-flow  { animation: asha-flow  2.4s ease-in-out infinite; }
    .core-scan  { animation: asha-scan  2.8s linear infinite; }
    .core-glow  { animation: asha-glow  1.6s ease-in-out infinite; }
    .core-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,.14); transition: all .25s; }
    .core-card { transition: all .25s; }
  `;

  const statusItems = [
    { label: "API REST",   ok: true  }, { label: "Base de Datos", ok: true  },
    { label: "Zoom",       ok: true  }, { label: "Email",         ok: true  },
    { label: "Pagos",      ok: true  }, { label: "IA Engine",     ok: true  },
    { label: "CDN",        ok: true  }, { label: "Auth",          ok: true  },
  ];

  const mainServices = [
    {
      icon: "🤖", label: "ASHI AI", tag: "Inteligencia Artificial", color: "#7C3AED", bg: "#F5F3FF",
      status: "Operativo",
      metrics: [{ k: "Consultas hoy", v: "2,847" }, { k: "Tiempo respuesta", v: "98 ms" }, { k: "Uso del día", v: "73%" }, { k: "Modelos activos", v: "3" }],
      bar: 73,
    },
    {
      icon: "📧", label: "Centro de Correos", tag: "SMTP Engine", color: "#0D9488", bg: "#F0FDFA",
      status: "Operativo",
      metrics: [{ k: "Enviados", v: "1,248" }, { k: "Pendientes", v: "12" }, { k: "Fallidos", v: "3" }, { k: "Plantillas", v: "18" }],
      bar: 91,
    },
    {
      icon: "🔔", label: "Notificaciones", tag: "Push & In-App", color: "#F97316", bg: "#FFF7ED",
      status: "Operativo",
      metrics: [{ k: "Enviadas", v: "4,821" }, { k: "Push", v: "3,102" }, { k: "Email", v: "1,248" }, { k: "Recordatorios", v: "471" }],
      bar: 88,
    },
    {
      icon: "💬", label: "Mensajería", tag: "Chat Engine", color: "#2563EB", bg: "#EFF6FF",
      status: "Operativo",
      metrics: [{ k: "Conversaciones", v: "38" }, { k: "Archivos", v: "142" }, { k: "Mensajes hoy", v: "891" }, { k: "Usuarios en línea", v: "24" }],
      bar: 62,
    },
  ];

  const opsServices = [
    {
      icon: "📄", label: "Gestor de Documentos", tag: "Document Engine", color: "#DC2626", bg: "#FFF5F5",
      metrics: [{ k: "PDFs", v: "487" }, { k: "Archivos", v: "2,341" }, { k: "Reportes", v: "89" }, { k: "Espacio", v: "2.4 GB" }],
      bar: 48,
    },
    {
      icon: "🗓", label: "Agenda Engine", tag: "Scheduler", color: "#7C3AED", bg: "#F5F3FF",
      metrics: [{ k: "Sesiones prog.", v: "156" }, { k: "Conflictos", v: "2" }, { k: "Recordatorios", v: "48" }, { k: "Sincronizado", v: "Sí" }],
      bar: 82,
    },
    {
      icon: "🎥", label: "ASHA Session Engine", tag: "Videollamadas", color: "#0D9488", bg: "#F0FDFA",
      metrics: [{ k: "Activas", v: "3" }, { k: "Promedio", v: "47 min" }, { k: "Calidad", v: "98.2%" }, { k: "Grabadas", v: "142" }],
      bar: 95,
    },
    {
      icon: "💳", label: "Módulo de Pagos", tag: "Pagos & Cobros", color: "#059669", bg: "#F0FDF4",
      metrics: [{ k: "Procesados", v: "89" }, { k: "Reembolsos", v: "1" }, { k: "Métodos", v: "3" }, { k: "Estado", v: "activo" }],
      bar: 78,
    },
  ];

  const smartServices = [
    {
      icon: "📊", label: "Analytics Engine", tag: "Datos & KPIs", color: "#7C3AED", bg: "#F5F3FF",
      metrics: [{ k: "Eventos proc.", v: "48,291" }, { k: "KPIs", v: "24" }, { k: "Reportes auto.", v: "12" }, { k: "Gráficos", v: "38" }],
      bar: 84,
    },
    {
      icon: "🎮", label: "Mundo ASHA Engine", tag: "Gamificación", color: "#F97316", bg: "#FFF7ED",
      metrics: [{ k: "Actividades", v: "234" }, { k: "XP otorgado", v: "12,847" }, { k: "Insignias", v: "891" }, { k: "Videos", v: "48" }],
      bar: 67,
    },
    {
      icon: "🔐", label: "Security Center", tag: "Auth & Logs", color: "#DC2626", bg: "#FFF5F5",
      metrics: [{ k: "Conectados", v: "42" }, { k: "Sesiones", v: "38" }, { k: "Intentos fall.", v: "3" }, { k: "Dispositivos", v: "67" }],
      bar: 99,
    },
  ];

  const eventFlow = [
    { label: "Padre agenda sesión",  icon: "👨‍👩‍👧", color: "#7C3AED" },
    { label: "Agenda Engine",        icon: "🗓",       color: "#2563EB" },
    { label: "Módulo de Pagos",      icon: "💳",       color: "#059669" },
    { label: "Centro de Correos",    icon: "📧",       color: "#0D9488" },
    { label: "Notificaciones",       icon: "🔔",       color: "#F97316" },
    { label: "Calendario",           icon: "📅",       color: "#7C3AED" },
    { label: "Terapeuta",            icon: "👩‍⚕️",     color: "#EC4899" },
    { label: "Administrador",        icon: "🛡️",       color: "#DC2626" },
    { label: "Analytics",            icon: "📊",       color: "#8B5CF6" },
    { label: "Base de Datos",        icon: "🗄️",       color: "#374151" },
  ];

  const systemMetrics = [
    { label: "CPU",         val: 34, unit: "%",    color: "#059669", ok: true  },
    { label: "RAM",         val: 61, unit: "%",    color: "#2563EB", ok: true  },
    { label: "API REST",    val: 99, unit: "% up", color: "#059669", ok: true  },
    { label: "Base Datos",  val: 98, unit: "% up", color: "#059669", ok: true  },
    { label: "Zoom",        val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "Email SMTP",  val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "Pagos",       val: 100,unit: "% up", color: "#059669", ok: true  },
    { label: "IA Engine",   val: 97, unit: "% up", color: "#059669", ok: true  },
  ];

  const archLayers = [
    { label: "Sitio Público",        icon: <Globe size={16} />,    color: "#2563EB", bg: "#EFF6FF" },
    { label: "Centro Familiar",      icon: <Heart size={16} />,    color: "#EC4899", bg: "#FDF2F8" },
    { label: "Centro Profesional",   icon: <Stethoscope size={16}/>,color: "#0D9488", bg: "#F0FDFA" },
    { label: "Centro de Operaciones",icon: <BarChart2 size={16} />,color: "#F97316", bg: "#FFF7ED" },
    { label: "ASHA Core",            icon: <Cpu size={16} />,      color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Spring Boot API",      icon: <Server size={16} />,   color: "#374151", bg: "#F9FAFB" },
    { label: "MySQL",                icon: <Database size={16} />, color: "#059669", bg: "#F0FDF4" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <style>{coreStyles}</style>

      {/* ── Header ── */}
      <div className="rounded-3xl p-5 mb-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #1e3a5f 60%, #0D9488 100%)` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="absolute -bottom-8 left-1/3 w-64 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0D9488, transparent)" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.15)" }}>
                  <Cpu size={18} color="white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-none">ASHA Core</h2>
                  <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,.6)" }}>Sistema de servicios integrados · v2.4.1</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="core-pulse inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Todos los servicios operativos</span>
                <span className="text-xs font-medium ml-2" style={{ color: "rgba(255,255,255,.45)" }}>Última sync: hace 2 min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-2xl px-3 py-2 cursor-pointer" style={{ background: "rgba(255,255,255,.1)" }}>
                <Search size={13} color="rgba(255,255,255,.7)" />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,.5)" }}>Buscar servicios…</span>
              </div>
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center cursor-pointer" style={{ background: "rgba(255,255,255,.1)" }}>
                <Bell size={15} color="rgba(255,255,255,.8)" />
              </div>
            </div>
          </div>
          {/* Status strip */}
          <div className="flex flex-wrap gap-2">
            {statusItems.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 rounded-xl px-2.5 py-1" style={{ background: "rgba(255,255,255,.08)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,.75)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 1: Servicios Principales ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.violet }} />
          <h3 className="font-black text-[#1C1135]">Servicios Principales</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.violetLight, color: B.violet }}>4 activos</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}18`, color: s.color }}>● {s.status}</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% capacidad</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Servicios Operativos ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.teal }} />
          <h3 className="font-black text-[#1C1135]">Servicios Operativos</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.tealLight, color: B.teal }}>4 activos</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opsServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>● Activo</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% eficiencia</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Servicios Inteligentes ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.orange }} />
          <h3 className="font-black text-[#1C1135]">Servicios Inteligentes</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>3 activos</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {smartServices.map(s => (
            <div key={s.label} className="core-card rounded-3xl p-5 cursor-pointer" style={{ background: s.bg, border: `1px solid ${s.color}18` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>● Activo</span>
              </div>
              <p className="font-black text-sm text-[#1C1135] mb-0.5">{s.label}</p>
              <p className="text-xs font-medium text-[#7C6F9A] mb-3">{s.tag}</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.metrics.map(m => (
                  <div key={m.k} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,.7)" }}>
                    <p className="text-xs text-[#9E95B7] font-medium leading-none mb-0.5">{m.k}</p>
                    <p className="font-black text-xs text-[#1C1135]">{m.v}</p>
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
              <p className="text-xs font-bold mt-1 text-right" style={{ color: s.color }}>{s.bar}% rendimiento</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: ASHA Event Center ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "#2563EB" }} />
          <h3 className="font-black text-[#1C1135]">ASHA Event Center</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>Flujo en tiempo real</span>
        </div>
        <div className="rounded-3xl p-6 overflow-hidden" style={{ background: `linear-gradient(145deg, ${B.violetDeep}, #1a3461)` }}>
          <p className="text-xs font-medium mb-6 text-center" style={{ color: "rgba(255,255,255,.5)" }}>
            Ciclo de vida de una sesión terapéutica — todos los servicios coordinados automáticamente
          </p>
          <div className="flex flex-col items-center gap-0 max-w-sm mx-auto">
            {eventFlow.map((node, i) => (
              <div key={node.label} className="flex flex-col items-center w-full">
                {/* Node */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <div className="flex-1 h-px opacity-20" style={{ background: node.color }} />
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 min-w-0"
                    style={{ background: `${node.color}22`, border: `1px solid ${node.color}44` }}>
                    <span className="text-base">{node.icon}</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">{node.label}</span>
                  </div>
                  <div className="flex-1 h-px opacity-20" style={{ background: node.color }} />
                </div>
                {/* Connector */}
                {i < eventFlow.length - 1 && (
                  <div className="flex flex-col items-center my-1" style={{ height: 28 }}>
                    <div className="w-px flex-1 opacity-30" style={{ background: `linear-gradient(to bottom, ${node.color}, ${eventFlow[i+1].color})` }} />
                    <div className="core-flow w-1.5 h-1.5 rounded-full" style={{ background: eventFlow[i+1].color, marginTop: -3 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs font-medium mt-5" style={{ color: "rgba(255,255,255,.4)" }}>
            11 microservicios · &lt;200 ms de latencia · 99.98% uptime
          </p>
        </div>
      </div>

      {/* ── Section 5: System Monitor ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: "#059669" }} />
          <h3 className="font-black text-[#1C1135]">Monitoreo del Sistema</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Todo en verde</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {systemMetrics.map(m => (
            <div key={m.label} className="core-card rounded-2xl p-4 text-center" style={{ background: "white", border: `1px solid ${B.border}` }}>
              <div className="relative w-12 h-12 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#E8E5F4" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke={m.color} strokeWidth="3"
                    strokeDasharray={`${(m.val / 100) * 94.2} 94.2`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-[#1C1135]">{m.val}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-[#7C6F9A]">{m.label}</p>
              <p className="text-xs font-medium" style={{ color: m.color }}>{m.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Architecture ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: B.textMid }} />
          <h3 className="font-black text-[#1C1135]">Arquitectura del Ecosistema</h3>
        </div>
        <div className="rounded-3xl p-6" style={{ background: "white", border: `1px solid ${B.border}` }}>
          <div className="flex flex-col items-center gap-0 max-w-lg mx-auto">
            {archLayers.map((layer, i) => (
              <div key={layer.label} className="flex flex-col items-center w-full">
                <div className="core-card flex items-center gap-3 rounded-2xl px-5 py-3 w-full max-w-xs justify-center cursor-pointer"
                  style={{ background: layer.bg, border: `1px solid ${layer.color}22` }}>
                  <span style={{ color: layer.color }}>{layer.icon}</span>
                  <span className="font-extrabold text-sm text-[#1C1135]">{layer.label}</span>
                </div>
                {i < archLayers.length - 1 && (
                  <div className="flex flex-col items-center my-1" style={{ height: 24 }}>
                    <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, ${layer.color}60, ${archLayers[i+1].color}60)` }} />
                    <svg width="10" height="6" viewBox="0 0 10 6" style={{ color: archLayers[i+1].color }}>
                      <path d="M0 0 L5 5 L10 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#9E95B7] font-medium mt-5">
            ASHAKids · Arquitectura de microservicios · Spring Boot + React · MySQL 8.0
          </p>
        </div>
      </div>
    </div>
  );
}
