import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { X } from "lucide-react";
import { B } from "@/theme/brand/B";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowPwConfirmModal" | "setPwConfirmInput" | "pwConfirmInput" | "onNameChange" | "nombre" | "showToast">;
export function PadreConfigShowPwConfirmModal({ setShowPwConfirmModal, setPwConfirmInput, pwConfirmInput, onNameChange, nombre, showToast }: Props) {
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">Confirmar identidad</h2>
              <button
                onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-[#7C6F9A] font-medium">
                Por seguridad, ingresa tu contraseña actual para guardar los cambios.
              </p>
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">Contraseña actual</label>
                <input
                  type="password"
                  value={pwConfirmInput}
                  onChange={(e) => setPwConfirmInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPwConfirmModal(false); setPwConfirmInput(""); }}
                  className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={!pwConfirmInput}
                  onClick={() => {
                    setShowPwConfirmModal(false);
                    setPwConfirmInput("");
                    onNameChange?.(nombre);
                    showToast("Cambios guardados correctamente");
                  }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-colors disabled:opacity-40"
                  style={{ background: B.violet }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>);
}
