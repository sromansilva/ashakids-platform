import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { X } from "lucide-react";
import { B } from "@/theme/brand/B";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowPhotoModal" | "selectedAvatar" | "userAvatarOptions" | "setSelectedAvatar" | "showToast">;
export function PadreConfigShowPhotoModal({ setShowPhotoModal, selectedAvatar, userAvatarOptions, setSelectedAvatar, showToast }: Props) {
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPhotoModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">
                Elige tu avatar
              </h2>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center gap-4 mb-5">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl border-2 border-violet-300 shadow-md"
                  style={{ background: B.violetLight }}
                >
                  {selectedAvatar}
                </div>
                <p className="text-xs font-bold text-[#7C6F9A]">Avatar seleccionado</p>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {userAvatarOptions.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAvatar(a)}
                    className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all hover:scale-110 ${selectedAvatar === a ? "ring-2 ring-violet-500 scale-110" : ""}`}
                    style={{ background: selectedAvatar === a ? B.violetLight : "#F9F8FE" }}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  showToast("Avatar actualizado");
                }}
                className="mt-5 w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-colors"
                style={{ background: B.violet }}
              >
                Confirmar selección
              </button>
            </div>
          </div>
        </div>);
}
