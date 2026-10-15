import { useState } from "react";
import { patientsService } from "@/services/clinicalService";
import { useWrite } from "@/hooks/useRemoteData";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Plus, X, Check } from "lucide-react";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";
import { PACIENTE_AVATARES } from "@/config/avatars";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowAddChildModal" | "setNewCN" | "setNewBirth" | "setNewAvatar" | "newAvatar" | "avatarOptions" | "newCN" | "newBirth" | "setNewCA" | "newCA" | "setChildList" | "showToast">;
export function PadreConfigShowAddChildModal({ setShowAddChildModal, setNewCN, setNewBirth, setNewAvatar, newAvatar, avatarOptions: _avatarOptions, newCN, newBirth, setNewCA, newCA, setChildList, showToast }: Props) {
const [surname, setSurname] = useState(""); const [sex, setSex] = useState("");
const save = useWrite(() => patientsService.create({
  nombres_paciente: newCN,
  apellidos_paciente: surname,
  fecha_nacimiento: newBirth,
  sexo: sex,
  avatar_nombre: newAvatar || "zorro",
}), () => {
  setChildList(); setShowAddChildModal(false); setNewCN(""); setNewBirth(""); setNewAvatar("zorro"); setNewCA(""); showToast("Hijo registrado en el servidor");
});
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddChildModal(false)}
          />
          <div role="dialog" aria-modal="true" aria-label="Añadir hijo" className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
              <h2 className="font-extrabold text-[#1C1135]">
                Añadir hijo
              </h2>
              <button
                onClick={() => {
                  setShowAddChildModal(false);
                  setNewCN("");
                  setNewBirth("");
                  setNewAvatar("zorro");
                }}
                aria-label="Cerrar formulario de hijo"
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
              {/* Avatar Selector */}
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">
                  Avatar del hijo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PACIENTE_AVATARES.map((av) => {
                    const isSelected = (newAvatar || "zorro") === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setNewAvatar(av.id)}
                        className={`group relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-violet-600 bg-violet-50/70 shadow-sm"
                            : "border-[#E8E5F4] bg-white hover:border-violet-300 hover:bg-slate-50"
                        }`}
                        aria-label={`Seleccionar avatar ${av.name}`}
                      >
                        <img
                          src={av.imagePath}
                          alt={av.name}
                          className="w-11 h-11 rounded-xl object-cover mb-1 border border-black/5"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/avatar_paciente/zorro.jpg";
                          }}
                        />
                        <span className={`text-[11px] font-bold truncate max-w-full ${isSelected ? "text-violet-700" : "text-[#7C6F9A]"}`}>
                          {av.name.split(" ")[0]}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <Inp
                label="Nombres"
                placeholder="Ej. Lucía"
                value={newCN}
                onChange={setNewCN}
              />
              <Inp label="Apellidos" value={surname} onChange={setSurname} />
              <Inp label="Sexo" value={sex} onChange={setSex} />
              <RemoteFeedback error={save.error} />
              {/* Birth date */}
              <div>
                <label htmlFor="new-child-birthdate" className="block text-sm font-bold text-[#1C1135] mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  id="new-child-birthdate"
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
