import { B } from "@/theme/brand/B";

// ─── Types ─────────────────────────────────────────────────────────────────────

export function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#7C6F9A]">{label ?? `${current} de ${total}`}</span>
        <span className="text-xs font-bold" style={{ color: B.violet }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#E8E5F4] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${B.violet}, #A78BFA)` }}
        />
      </div>
    </div>
  );
}
