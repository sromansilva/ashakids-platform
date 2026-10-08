import { useState } from "react";
import { Download } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

// ─── ASHA Pay ──────────────────────────────────────────────────────────────────

export function AshaPayWallet({ go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<"wallet" | "rewards">("wallet");
  const movements = [
    { icon: "💳", desc: "Sesión Dra. Ana Ruiz",      date: "29 Jul",  amount: -45,   type: "pago"       },
    { icon: "💎", desc: "Bonificación mensual",       date: "25 Jul",  amount: +20,   type: "bono"       },
    { icon: "↩️", desc: "Reembolso sesión cancelada", date: "20 Jul",  amount: +55,   type: "reembolso"  },
    { icon: "💳", desc: "Sesión Lic. C. Mendoza",    date: "15 Jul",  amount: -50,   type: "pago"       },
    { icon: "🔄", desc: "Recarga manual",             date: "10 Jul",  amount: +100,  type: "recarga"    },
    { icon: "💳", desc: "Sesión Dra. Ana Ruiz",      date: "06 Jul",  amount: -45,   type: "pago"       },
  ];
  const rewards = [
    { icon: "⭐", name: "Sesión completada",     pts: 135, date: "29 Jul", redeemable: false },
    { icon: "🏅", name: "Racha 7 días",          pts: 70,  date: "29 Jul", redeemable: false },
    { icon: "🎁", name: "Código ASHA20",         pts: -90, date: "22 Jul", redeemable: false },
    { icon: "⭐", name: "Sesión completada",     pts: 150, date: "22 Jul", redeemable: false },
    { icon: "💎", name: "Bono nuevos usuarios",  pts: 500, date: "01 Jun", redeemable: false },
  ];
  const totalPts = rewards.reduce((a, r) => a + r.pts, 0);

  const redeemOptions = [
    { icon: "💰", name: "S/ 10 de descuento",    pts: 500, bg: "#DCFCE7", color: "#16A34A" },
    { icon: "🎓", name: "Sesión gratis 45 min",  pts: 1500, bg: B.violetLight, color: B.violet  },
    { icon: "📚", name: "Material educativo",    pts: 300, bg: "#FEF3C7",  color: "#B45309" },
    { icon: "🎮", name: "Actividad Premium",     pts: 200, bg: B.tealLight, color: B.teal   },
  ];

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        <h1 className="text-2xl font-black text-[#1C1135] mb-6">💙 Wallet ASHA</h1>

        {/* Balance hero card */}
        <div className="rounded-3xl overflow-hidden mb-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 50%, ${B.teal} 100%)` }}>
          <div className="p-7 sm:p-9">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Saldo disponible</p>
                <p className="text-5xl font-black text-white mb-1">S/ 120.00</p>
                <p className="text-violet-200 text-sm font-medium">Actualizado hace 2 min</p>
                <div className="flex gap-3 mt-5">
                  <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all border border-white/20">
                    ⬆️ Recargar
                  </button>
                  <button onClick={() => go("pay/history")}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-all border border-white/20">
                    📋 Historial
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Puntos ASHA</p>
                <p className="text-4xl font-black text-amber-300">{totalPts}</p>
                <p className="text-violet-200 text-xs font-medium">pts canjeables</p>
              </div>
            </div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 divide-x" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.1)" }}>
            {[["💸","Gastado","S/ 140"],["💎","Bonos","S/ 75"],["↩️","Reembolsos","S/ 55"]].map(([icon,label,val]) => (
              <div key={label} className="py-4 text-center">
                <div className="text-xl mb-0.5">{icon}</div>
                <p className="text-xs text-violet-300 font-medium">{label}</p>
                <p className="text-sm font-extrabold text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["wallet", "rewards"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all capitalize ${tab === t ? "bg-violet-700 text-white" : "bg-white border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50"}`}>
              {t === "wallet" ? "💙 Movimientos" : "⭐ Recompensas"}
            </button>
          ))}
        </div>

        {tab === "wallet" && (
          <Crd>
            <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
              <h3 className="font-extrabold text-[#1C1135]">Últimos movimientos</h3>
              <Btn size="sm" variant="ghost"><Download size={13} /> Exportar</Btn>
            </div>
            <div className="divide-y divide-[#FAFAF9]">
              {movements.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F5F3FF] transition-colors">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: m.amount > 0 ? "#DCFCE7" : B.violetLight }}>
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[#1C1135]">{m.desc}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{m.date} · {m.type}</p>
                  </div>
                  <p className={`font-black text-base ${m.amount > 0 ? "text-emerald-600" : "text-[#1C1135]"}`}>
                    {m.amount > 0 ? "+" : ""}S/ {Math.abs(m.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Crd>
        )}

        {tab === "rewards" && (
          <>
            {/* Points balance */}
            <div className="rounded-3xl p-5 mb-5 border-2 border-amber-200" style={{ background: "#FEF9EE" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">🌟 Tus puntos</p>
                  <p className="font-black text-4xl text-amber-600">{totalPts}</p>
                  <p className="text-xs text-amber-600 font-medium">puntos disponibles</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-600 font-medium">Equivalen a</p>
                  <p className="font-black text-xl text-amber-700">S/ {(totalPts / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: "#FDE68A" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min((totalPts / 2000) * 100, 100)}%`, background: "#F59E0B" }} />
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1">{2000 - totalPts} pts para el siguiente nivel</p>
            </div>

            {/* Redeem options */}
            <h3 className="font-extrabold text-[#1C1135] mb-4">Canjear puntos</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {redeemOptions.map(opt => (
                <div key={opt.name} className="rounded-3xl p-5 border-2" style={{ background: opt.bg, borderColor: opt.color + "40" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{opt.icon}</div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: opt.color, color: "white" }}>
                      {opt.pts} pts
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1135] mb-3">{opt.name}</p>
                  <button
                    disabled={totalPts < opt.pts}
                    className={`w-full py-2 rounded-xl text-sm font-extrabold transition-all ${totalPts >= opt.pts ? "hover:opacity-90 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    style={totalPts >= opt.pts ? { background: opt.color } : {}}>
                    {totalPts >= opt.pts ? "Canjear" : `Faltan ${opt.pts - totalPts} pts`}
                  </button>
                </div>
              ))}
            </div>

            {/* Points history */}
            <h3 className="font-extrabold text-[#1C1135] mb-3">Historial de puntos</h3>
            <Crd>
              <div className="divide-y divide-[#FAFAF9]">
                {rewards.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#FEF3C7" }}>{r.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-[#1C1135]">{r.name}</p>
                      <p className="text-xs text-[#9E95B7] font-medium">{r.date}</p>
                    </div>
                    <p className={`font-black text-sm ${r.pts > 0 ? "text-amber-600" : "text-[#7C6F9A]"}`}>
                      {r.pts > 0 ? "+" : ""}{r.pts} pts
                    </p>
                  </div>
                ))}
              </div>
            </Crd>
          </>
        )}
      </div>
    </div>
  );
}
