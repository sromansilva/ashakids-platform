import React from "react";
import { Download } from "lucide-react";
import { B, Btn, Crd, Av } from "@/components/shared";

export function AdminFinanzas() {
  const monthlyIncome = [
    { mes: "Feb", val: 2800 }, { mes: "Mar", val: 3100 }, { mes: "Abr", val: 2950 },
    { mes: "May", val: 3600 }, { mes: "Jun", val: 4100 }, { mes: "Jul", val: 4450 },
  ];
  const maxIncome = 4450;
  const transactions = [
    { user: "Laura Gómez",   concept: "Paquete 4 sesiones", amount: "—",  date: "28 Jul", status: "cobrado",   av: "LG", color: B.violet  },
    { user: "Andrés Ríos",   concept: "Paquete 4 sesiones", amount: "—",  date: "26 Jul", status: "cobrado",   av: "AR", color: "#22C55E" },
    { user: "Rosa López",    concept: "Paquete 4 sesiones", amount: "—",  date: "22 Jul", status: "pendiente", av: "RL", color: B.teal    },
    { user: "Claudia Torres",concept: "Paquete 2 sesiones", amount: "—",  date: "20 Jul", status: "cobrado",   av: "CT", color: B.orange  },
    { user: "Jorge Vargas",  concept: "Reembolso",          amount: "—",  date: "18 Jul", status: "reembolso", av: "JV", color: "#8B5CF6" },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Información de Pagos</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Gestión de pagos · Julio 2026 · <span className="font-extrabold text-orange-500">Datos simulados</span></p>
        </div>
        <Btn size="sm" variant="ghost"><Download size={13} /> Exportar reporte</Btn>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pagos julio",        val: "—",  color: "#059669", bg: "#D1FAE5",     trend: "simulado" },
          { label: "Sesiones cobradas",  val: "22", color: B.violet,  bg: B.violetLight, trend: "de 25 sesiones" },
          { label: "Reembolsos",         val: "1",  color: "#DC2626", bg: "#FEE2E2",     trend: "1 solicitud" },
          { label: "Comisión plataforma",val: "—",  color: B.orange,  bg: B.orangeLight, trend: "por definir" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium mb-1">{s.label}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Ingresos mensuales</h4>
          <div className="flex items-end gap-2 h-32 mb-3">
            {monthlyIncome.map((d, i) => {
              const pct = Math.round((d.val / maxIncome) * 100);
              const isLast = i === monthlyIncome.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>—</span>
                  <div className="w-full rounded-t-xl" style={{ height: `${pct}%`, background: isLast ? "#059669" : "#D1FAE5", minHeight: 6 }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-4">Estado de pagos · Julio</h4>
          {[
            { label: "Cobrados",  pct: 88, val: "88%",  color: "#059669" },
            { label: "Pendientes",pct: 8,  val: "8%",   color: B.orange  },
            { label: "Reembolsos",pct: 4,  val: "4%",   color: "#DC2626" },
          ].map(s => (
            <div key={s.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#7C6F9A] font-medium">{s.label}</span>
                <div className="flex gap-2">
                  <span className="font-extrabold text-[#1C1135]">{s.val}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
              </div>
              <div className="h-3 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </Crd>
      </div>
      <Crd>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Últimas transacciones</h4>
          <Btn size="sm" variant="ghost"><Download size={12} /> Exportar CSV</Btn>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {transactions.map((t, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Av initials={t.av} color={t.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{t.user}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{t.concept}</p>
              </div>
              <div className="text-right">
                <p className="font-black" style={{ color: t.amount.startsWith("+") ? "#059669" : "#DC2626" }}>{t.amount}</p>
                <p className="text-xs text-[#9E95B7]">{t.date}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: t.status === "cobrado" ? "#D1FAE5" : t.status === "pendiente" ? B.orangeLight : "#FEE2E2", color: t.status === "cobrado" ? "#059669" : t.status === "pendiente" ? B.orange : "#DC2626" }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

// ── Alias ──────────────────────────────────────────────────────────────────────
export const AdminPagos = AdminFinanzas;
