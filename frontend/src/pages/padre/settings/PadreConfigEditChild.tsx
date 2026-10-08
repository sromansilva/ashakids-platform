import { patientsService } from "@/services/clinicalService";
import { useWrite } from "@/hooks/useRemoteData";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { X } from "lucide-react";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setEditChild" | "editChild" | "setChildList" | "showToast">;
export function PadreConfigEditChild({ setEditChild, editChild, setChildList, showToast }: Props) {
const save = useWrite(() => patientsService.edit(editChild!.id, { nombres_paciente: editChild!.name, apellidos_paciente: editChild!.surname, fecha_nacimiento: editChild!.birthdate, sexo: editChild!.sex }), () => { setChildList(); setEditChild(null); showToast("Cambios guardados en el servidor"); });
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditChild(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135]">
                Editar a {editChild.name}
              </h2>
              <button
                onClick={() => setEditChild(null)}
                className="p-2 rounded-xl hover:bg-violet-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Inp
                label="Nombre"
                value={editChild.name}
                onChange={(v) =>
                  setEditChild((ec) =>
                    ec ? { ...ec, name: v } : null,
                  )
                }
              />
              <div>
                <label className="block text-sm font-bold text-[#1C1135] mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={(editChild as any).birthdate || ""}
                  onChange={(e) =>
                    setEditChild((ec) =>
                      ec ? { ...ec, birthdate: e.target.value, age: e.target.value ? `${Math.floor((Date.now() - new Date(e.target.value).getTime()) / 31557600000)} años` : (ec as any).age } as any : null
                    )
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                  style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
                />
                {(editChild as any).birthdate && (
                  <p className="mt-1.5 text-xs font-bold text-violet-600">
                    📅 {Math.floor((Date.now() - new Date((editChild as any).birthdate).getTime()) / 31557600000)} años
                  </p>
                )}
              </div>
              <Inp label="Apellidos" value={editChild.surname} onChange={surname => setEditChild(c => c ? { ...c, surname } : null)} />
              <Inp label="Sexo" value={editChild.sex} onChange={sex => setEditChild(c => c ? { ...c, sex } : null)} />
              <RemoteFeedback error={save.error} />
              <div className="flex gap-3">
                <Btn
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => setEditChild(null)}
                >
                  Cancelar
                </Btn>
                <Btn
                  variant="primary"
                  className="flex-1 justify-center"
                  disabled={save.isPending} onClick={() => void save.submit(undefined)}
                >
                  Guardar
                </Btn>
              </div>
            </div>
          </div>
        </div>);
}
