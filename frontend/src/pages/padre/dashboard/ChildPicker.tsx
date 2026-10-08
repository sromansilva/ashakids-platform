import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { kids } from "@/mocks/demo";

export function ChildPicker({ activeChild, setActiveChild }: { activeChild: number; setActiveChild: (i: number, changed: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => { document.removeEventListener("mousedown", handleOutside); document.removeEventListener("keydown", handleEsc); };
  }, [open]);

  const current = kids[activeChild];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Viendo a ${current.name}. Cambiar niño`}
        className="flex items-center gap-2 bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#E8E5F4] rounded-2xl px-3 py-2 transition-colors"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        <span className="text-lg leading-none" aria-hidden="true">{current.emoji}</span>
        <div className="leading-none text-left">
          <p className="text-[10px] text-[#9E95B7] font-bold uppercase tracking-wide leading-none mb-0.5">Viendo</p>
          <p className="text-sm font-extrabold text-[#1C1135] leading-none">{current.name}</p>
        </div>
        <ChevronDown size={14} className={`text-[#9E95B7] transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar niño"
          className="absolute left-0 top-full mt-2 bg-white rounded-2xl border border-[#E8E5F4] py-1.5 z-50 min-w-[160px]"
          style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.13), 0 2px 8px rgba(0,0,0,0.07)", fontFamily: '"Nunito", system-ui, sans-serif' }}
        >
          {kids.map((k, i) => (
            <button
              key={k.id}
              role="option"
              aria-selected={activeChild === i}
              onClick={() => { setActiveChild(i, i !== activeChild); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${activeChild === i ? "bg-violet-50" : "hover:bg-[#F5F3FF]"}`}
            >
              <span className="text-lg leading-none" aria-hidden="true">{k.emoji}</span>
              <span className={`text-sm font-bold flex-1 ${activeChild === i ? "text-violet-700" : "text-[#1C1135]"}`}>{k.name}</span>
              {activeChild === i && <Check size={14} className="text-violet-600 flex-shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
