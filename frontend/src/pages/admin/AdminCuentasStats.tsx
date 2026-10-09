import React from "react";
import { Search } from "lucide-react";
import { B } from "@/theme/brand/B";
import type { TabRole } from "./AdminCuentas";

interface AdminCuentasStatsProps {
  famCount: number;
  terCount: number;
  activasCount: number;
  suspCount: number;
  tab: TabRole;
  search: string;
  onTabChange: (t: TabRole) => void;
  onSearchChange: (s: string) => void;
}

export const AdminCuentasStats: React.FC<AdminCuentasStatsProps> = ({
  famCount,
  terCount,
  activasCount,
  suspCount,
  tab,
  search,
  onTabChange,
  onSearchChange,
}) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Familias", value: famCount, icon: "👨‍👩‍👧‍👦", bg: B.violetLight, color: B.violet },
          { label: "Terapeutas", value: terCount, icon: "👩‍⚕️", bg: "#F0FDFA", color: B.teal },
          { label: "Total activas", value: activasCount, icon: "🔐", bg: "#FFFBEB", color: B.orange },
          { label: "Suspendidas", value: suspCount, icon: "⛔", bg: "#FEF2F2", color: "#DC2626" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-3 border border-[#E8E5F4]/60 bg-white"
            style={{ background: s.bg }}
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-black" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs font-bold text-[#7C6F9A]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden p-1 gap-1">
          {(["PADRE", "TERAPEUTA"] as TabRole[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`flex-1 px-5 py-2 rounded-xl text-sm font-extrabold transition-all ${
                tab === t
                  ? "text-white shadow-sm"
                  : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"
              }`}
              style={tab === t ? { background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` } : {}}
            >
              {t === "PADRE" ? "👨‍👩‍👧‍👦 Familias / Padres" : "👩‍⚕️ Terapeutas"}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E8E5F4] rounded-2xl px-3 shadow-sm">
          <Search size={15} className="text-[#9E95B7]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código (ej. p00001), nombre o email…"
            className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#C4BDD8] py-2.5 outline-none"
          />
        </div>
      </div>
    </>
  );
};
export default AdminCuentasStats;
