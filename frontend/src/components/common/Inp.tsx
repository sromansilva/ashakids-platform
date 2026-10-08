import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Inp({ label, type = "text", placeholder, value, onChange, icon, hint, error }: {
  label?: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode; hint?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const t = type === "password" ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-bold text-[#1C1135]">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">{icon}</div>}
        <input type={t} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className={`w-full rounded-2xl border ${error ? "border-red-400" : "border-[#E8E5F4]"} bg-[#F5F3FF] px-4 py-3 text-sm text-[#1C1135] placeholder-[#9E95B7] focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all font-medium ${icon ? "pl-11" : ""} ${type === "password" ? "pr-11" : ""}`} />
        {type === "password" && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7] hover:text-violet-600">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-[#9E95B7] font-medium">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
