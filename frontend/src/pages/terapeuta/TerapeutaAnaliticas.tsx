import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";

export function TerapeutaAnaliticas() {
  const monthlyData = [
    { mes: "Feb", sesiones: 18, horas: 14 },
    { mes: "Mar", sesiones: 22, horas: 17 },
    { mes: "Abr", sesiones: 19, horas: 15 },
    { mes: "May", sesiones: 25, horas: 20 },
    { mes: "Jun", sesiones: 28, horas: 22 },
    { mes: "Jul", sesiones: 31, horas: 25 },
  ];
  const maxSes = 31;
  const areaStats = [
    { label: "Pacientes atendidos",   val: "18",   trend: "+3 mes",  color: B.violet  },
    { label: "Horas trabajadas",       val: "94",   trend: "+12 mes", color: B.teal    },
    { label: "Sesiones realizadas",    val: "143",  trend: "+18 mes", color: "#22C55E" },
    { label: "Asistencia",             val: "96%",  trend: "+2%",     color: "#F59E0B" },
    { label: "Cancelaciones",          val: "4",    trend: "-2 mes",  color: B.orange  },
    { label: "Prog. promedio",         val: "72%",  trend: "+8%",     color: "#8B5CF6" },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Analíticas</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Métricas de desempeño clínico · 2026</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {areaStats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: `${s.color}15` }}>
            <p className="font-black text-2xl text-[#1C1135] mb-1">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-snug mb-2">{s.label}</p>
            <span className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</span>
          </div>
        ))}
      </div>
      <div className="mb-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Sesiones por mes</h4>
          <div className="flex items-end gap-3 mb-3" style={{ height: 120 }}>
            {monthlyData.map((d, i) => {
              const barH = Math.max(4, Math.round((d.sesiones / maxSes) * 88));
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.sesiones}</span>
                  <div className="w-full rounded-t-xl transition-all" style={{ height: barH, background: isLast ? B.violet : B.violetLight }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
      </div>
      <Crd className="p-5">
        <h4 className="font-extrabold text-[#1C1135] mb-4">Objetivos alcanzados vs. planificados</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Alcanzados",   val: 38, total: 50, color: "#22C55E" },
            { label: "En progreso",  val: 9,  total: 50, color: "#F59E0B" },
            { label: "Pendientes",   val: 3,  total: 50, color: B.orange  },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: `${s.color}15` }}>
              <p className="font-black text-3xl text-[#1C1135] mb-1">{s.val}</p>
              <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
              <div className="mt-3 h-2 rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${(s.val/s.total)*100}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

