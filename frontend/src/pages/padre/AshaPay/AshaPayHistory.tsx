import { useState } from "react";
import { Download, Mail, Search } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";

// ─── ASHA Pay ──────────────────────────────────────────────────────────────────
import { TRANSACTIONS } from "@/pages/padre/AshaPay/TRANSACTIONS";

export function AshaPayHistory({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const statusColor: Record<string, "green" | "orange" | "red" | "gray"> = { pagado: "green", pendiente: "orange", cancelado: "red", reembolsado: "gray" };
  const filtered = TRANSACTIONS.filter(t =>
    (filter === "todos" || t.status === filter) &&
    (t.therapist.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search.toUpperCase()))
  );
  const totalPaid = TRANSACTIONS.filter(t => t.status === "pagado").reduce((a, t) => a + t.amount, 0);

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#1C1135]">Historial de Pagos</h1>
            <p className="text-sm text-[#7C6F9A] font-medium">Todos tus movimientos en ASHA Pay</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm"><Download size={13} /> Exportar</Btn>
            <Btn variant="cta" size="sm" onClick={() => go("pay")}>+ Nueva sesión</Btn>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "💳", val: `S/ ${totalPaid}`, label: "Total pagado",    bg: B.violetLight, color: B.violet  },
            { icon: "✅", val: String(TRANSACTIONS.filter(t => t.status === "pagado").length),     label: "Sesiones pagas",  bg: "#DCFCE7",     color: "#16A34A" },
            { icon: "⏳", val: String(TRANSACTIONS.filter(t => t.status === "pendiente").length),   label: "Pendientes",      bg: "#FEF3C7",     color: "#B45309" },
            { icon: "↩️", val: String(TRANSACTIONS.filter(t => t.status === "reembolsado").length), label: "Reembolsos",      bg: "#F1F5F9",     color: "#64748B" },
          ].map(s => (
            <Crd key={s.label} className="p-4 text-center">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl mx-auto mb-2" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <p className="font-black text-lg text-[#1C1135]">{s.val}</p>
              <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
            </Crd>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
            <input placeholder="Buscar por terapeuta o código…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["todos", "pagado", "pendiente", "cancelado", "reembolsado"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-extrabold capitalize transition-all ${filter === f ? "bg-violet-700 text-white" : "bg-white border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <Crd>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F5F3FF]">
                  {["ID", "Fecha", "Terapeuta", "Servicio", "Método", "Monto", "Estado", ""].map(h => (
                    <th key={h} className="text-left text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-[#FAFAF9] hover:bg-[#F5F3FF] transition-colors">
                    <td className="px-5 py-4 text-xs font-black text-violet-600 font-mono">#{tx.id}</td>
                    <td className="px-5 py-4 text-sm text-[#7C6F9A] font-medium">{tx.date}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-[#1C1135]">{tx.therapist}</td>
                    <td className="px-5 py-4 text-sm text-[#7C6F9A] font-medium">{tx.pkg}</td>
                    <td className="px-5 py-4 text-xl">{tx.method}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#1C1135]">S/ {tx.amount.toFixed(2)}</td>
                    <td className="px-5 py-4"><Bdg color={statusColor[tx.status] || "gray"}>{tx.status}</Bdg></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors" title="Descargar PDF"><Download size={13} /></button>
                        <button className="p-1.5 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors" title="Enviar correo"><Mail size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-bold text-[#9E95B7]">No se encontraron transacciones</p>
              </div>
            )}
          </div>
        </Crd>
      </div>
    </div>
  );
}
