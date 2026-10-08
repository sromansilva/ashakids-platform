import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

// ─── Shared micro components ──────────────────────────────────────────────────
import { Modal } from "@/pages/padre/Padre/Modal";

export function ConfirmModal({ title, desc, onConfirm, onClose, danger = false }: {
  title: string; desc: string; onConfirm: () => void; onClose: () => void; danger?: boolean;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl" style={{ background: danger ? "#FEE2E2" : B.warningLight }}>
            {danger ? "🗑️" : "⚠️"}
          </div>
        </div>
        <p className="text-sm text-[#7C6F9A] font-medium text-center mb-6 leading-relaxed">{desc}</p>
        <div className="flex gap-3">
          <Btn variant="outline" className="flex-1 justify-center" onClick={onClose}>Cancelar</Btn>
          <button onClick={onConfirm} className={`flex-1 rounded-2xl py-2.5 text-sm font-extrabold text-white transition-all active:scale-[.97] ${danger ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
            {danger ? "Sí, eliminar" : "Confirmar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
