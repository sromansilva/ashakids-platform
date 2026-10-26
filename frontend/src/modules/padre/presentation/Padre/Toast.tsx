import { useEffect } from "react";
import { X, CheckCircle } from "lucide-react";

export function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold animate-bounce-in"
      style={{ background: "linear-gradient(135deg, #059669, #0D9488)", boxShadow: "0 8px 32px rgba(5,150,105,.35)" }}>
      <CheckCircle size={16} /> {msg}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}
