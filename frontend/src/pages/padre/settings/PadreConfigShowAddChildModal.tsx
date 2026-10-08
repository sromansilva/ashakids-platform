import { useState } from "react";
import { patientsService } from "@/services/clinicalService";
import { useWrite } from "@/hooks/useRemoteData";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Plus, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowAddChildModal" | "setNewCN" | "setNewBirth" | "setNewAvatar" | "newAvatar" | "avatarOptions" | "newCN" | "newBirth" | "setNewCA" | "newCA" | "setChildList" | "showToast">;
export function PadreConfigShowAddChildModal({ setShowAddChildModal, setNewCN, setNewBirth, setNewAvatar, newAvatar, avatarOptions, newCN, newBirth, setNewCA, newCA, setChildList, showToast }: Props) {
const [surname, setSurname] = useState(""); const [sex, setSex] = useState("");
const save = useWrite(() => patientsService.create({ nombres_paciente: newCN, apellidos_paciente: surname, fecha_nacimiento: newBirth, sexo: sex }), () => {
  setChildList(); setShowAddChildModal(false); setNewCN(""); setNewBirth(""); setNewAvatar("🐻"); setNewCA(""); showToast("Hijo registrado en el servidor");
});
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddChildModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
              <h2 className="font-extrabold text-[#1C1135]">
                Añadir hijo
              </h2>
              <button
                onClick={() => {
                  setShowAddChildModal(false);
                  setNewCN("");
                  setNewBirth("");
                  setNewAvatar("🐻");
                }}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
              {/* Avatar picker */}
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-3">
                  Avatar
                </label>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border-2 border-violet-300 shadow-md"
                    style={{ background: B.violetLight }}
                  >
                    {newAvatar}
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 w-full">
                    {avatarOptions.map((a) => (
                      <button
                        key={a}
                        onClick={() => setNewAvatar(a)}
                        className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 ${newAvatar === a ? "ring-2 ring-violet-500 scale-110" : ""}`}
                        style={{
                          background:
                            newAvatar === a
                              ? B.violetLight
                              : "#F9F8FE",
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Name */}
              <Inp
                label="Nombre completo"
                placeholder="Ej. Lucía Gómez"
                value={newCN}
                onChange={setNewCN}
              />
              <Inp label="Apellidos" value={surname} onChange={setSurname} />
              <Inp label="Sexo" value={sex} onChange={setSex} />
              <RemoteFeedback error={save.error} />
              {/* Birth date */}
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={newBirth}
                  onChange={(e) => {
                    setNewBirth(e.target.value);
                    if (e.target.value) {
                      const age = Math.floor(
                        (Date.now() -
                          new Date(e.target.value).getTime()) /
                          31557600000,
                      );
                      setNewCA(String(age));
                    }
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{
                    fontFamily:
                      '"Nunito", system-ui, sans-serif',
                  }}
                />
                {newCA && (
                  <p className="mt-1.5 text-xs font-bold text-violet-600">
                    📅 {newCA} años
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex-shrink-0">
              <Btn
                variant="primary"
                className="w-full justify-center"
                disabled={save.isPending || !newCN || !surname || !sex || !newBirth}
                onClick={() => void save.submit(undefined)}
              >
                <Plus size={14} /> Agregar hijo
              </Btn>
            </div>
          </div>
        </div>);
}
