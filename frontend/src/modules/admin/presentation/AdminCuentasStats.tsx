import React from "react";
import { AudioLines, Search, ShieldCheck, ShieldOff, Users } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Familias", value: famCount, icon: Users, bg: "bg-[#F3E8FF]", color: "text-[#6B46FE]" },
          { label: "Terapeutas", value: terCount, icon: AudioLines, bg: "bg-[#E6FFFA]", color: "text-[#00A389]" },
          { label: "Total activas", value: activasCount, icon: ShieldCheck, bg: "bg-[#FFF4E5]", color: "text-[#FF8A00]" },
          { label: "Suspendidas", value: suspCount, icon: ShieldOff, bg: "bg-[#FEE2E2]", color: "text-[#EF4444]" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center gap-4 border border-[#E8E5F4] bg-white shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-3xl font-black text-[#1C1135] leading-none mb-1 tabular-nums">
                {s.value}
              </p>
              <p className="text-xs font-bold text-[#615274]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="inline-flex rounded-2xl border border-[#E8E5F4] bg-white p-1 gap-1 shadow-sm shrink-0">
          {(["PADRE", "TERAPEUTA"] as TabRole[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                tab === t
                  ? "bg-[#6B46FE] text-white shadow-md shadow-violet-200"
                  : "text-[#615274] hover:bg-violet-50 hover:text-[#6B46FE]"
              }`}
            >
              {t === "PADRE" ? "Familias / Padres" : "Terapeutas"}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white border border-[#E8E5F4] rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={18} className="text-[#8C82A8] shrink-0" />
          <input
            aria-label="Buscar cuentas"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por código (ej. p00001), nombre o email..."
            className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder-[#8C82A8] outline-none"
          />
        </div>
      </div>
    </>
  );
};
export default AdminCuentasStats;
