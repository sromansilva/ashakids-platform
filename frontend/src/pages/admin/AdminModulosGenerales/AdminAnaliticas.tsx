import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";

export function AdminAnaliticas() {
  const growthData = [
    { mes: "Feb", usuarios: 142 }, { mes: "Mar", usuarios: 189 }, { mes: "Abr", usuarios: 215 },
    { mes: "May", usuarios: 263 }, { mes: "Jun", usuarios: 298 }, { mes: "Jul", usuarios: 342 },
  ];
  const maxU = 342;
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Analíticas</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Métricas globales de la plataforma · 2026</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Usuarios nuevos (Jul)", val: "42",    color: B.violet,  bg: B.violetLight, trend: "+35% vs Jun" },
          { label: "Retención mensual",     val: "87%",   color: "#059669", bg: "#D1FAE5",     trend: "+2% vs Jun"  },
          { label: "Sesiones completadas",  val: "68%",   color: B.teal,    bg: B.tealLight,   trend: "del total"   },
          { label: "Sesiones virtuales",    val: "100%",  color: B.orange,  bg: B.orangeLight, trend: "del total"   },
          { label: "Uso Mundo ASHA",        val: "2,834", color: "#8B5CF6", bg: "#EDE9FE",     trend: "actividades" },
          { label: "Pagos (simulado)",      val: "—",     color: "#059669", bg: "#D1FAE5",     trend: "en definición"},
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium mb-1">{s.label}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Crecimiento de usuarios</h4>
          <div className="flex items-end gap-2 h-36 mb-3">
            {growthData.map((d, i) => {
              const pct = Math.round((d.usuarios / maxU) * 100);
              const isLast = i === growthData.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.usuarios}</span>
                  <div className="w-full rounded-t-xl" style={{ height: `${pct}%`, background: isLast ? B.violet : B.violetLight, minHeight: 6 }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-4">Distribución de uso por módulo</h4>
          {[
            { label: "Centro Familiar",  val: 78, color: B.violet  },
            { label: "Mundo ASHA",       val: 65, color: "#8B5CF6" },
            { label: "ASHA Session",     val: 89, color: B.teal    },
            { label: "Pagos",            val: 72, color: "#059669" },
            { label: "Mensajes",         val: 55, color: B.orange  },
          ].map(a => (
            <div key={a.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7C6F9A] font-medium">{a.label}</span>
                <span className="font-extrabold text-[#1C1135]">{a.val}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full" style={{ width: `${a.val}%`, backgroundColor: a.color }} />
              </div>
            </div>
          ))}
        </Crd>
      </div>
    </div>
  );
}
