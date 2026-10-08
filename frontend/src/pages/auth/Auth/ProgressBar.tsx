import { B } from "@/theme/brand/B";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{ background: i < step ? B.violet : i === step ? `${B.violet}50` : "#E8E5F4" }} />
      ))}
      <span className="text-xs font-bold text-[#9E95B7] flex-shrink-0">{step}/{total}</span>
    </div>
  );
}
