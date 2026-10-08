import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function FieldRow({ label, type = "text", placeholder, value, onChange, icon, error }: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; icon?: React.ReactNode; error?: string;
}) {
  const [show, setShow] = useState(false);
  const t = type === "password" && show ? "text" : type;
  return (
    <div>
      <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">{icon}</div>}
        <input type={t} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium focus:outline-none transition-colors bg-white ${icon ? "pl-10" : ""} ${error ? "border-red-400 bg-red-50" : "border-[#E8E5F4] focus:border-violet-400"}`} />
        {type === "password" && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}
