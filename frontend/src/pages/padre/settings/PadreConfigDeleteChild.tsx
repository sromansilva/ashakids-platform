import { patientsService } from "@/services/clinicalService";
import { useWrite } from "@/hooks/useRemoteData";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";
import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setDeleteChild" | "deleteChild" | "setChildList" | "showToast">;
export function PadreConfigDeleteChild({ setDeleteChild, deleteChild, setChildList, showToast }: Props) {
const save = useWrite(() => patientsService.deactivate(deleteChild!.id), () => { setChildList(); setDeleteChild(null); showToast("Paciente dado de baja; se conserva su historial"); });
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteChild(null)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ background: "#FEF2F2" }}
              >
                ⚠️
              </div>
              <h2 className="font-extrabold text-center text-[#1C1135] text-lg mb-2">
                Dar de baja a {deleteChild.name} {deleteChild.surname}
              </h2>
              <p className="text-sm text-center text-[#7C6F9A] font-medium mb-5">
                El perfil dejará de aparecer entre tus hijos activos. Su historial
                se conserva en el sistema. La reactivación requiere soporte del equipo.
              </p>
              <RemoteFeedback error={save.error} /><div className="flex gap-3">
                <Btn
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => setDeleteChild(null)}
                >
                  Cancelar
                </Btn>
                <Btn
                  variant="danger"
                  className="flex-1 justify-center"
                  disabled={save.isPending} onClick={() => void save.submit(undefined)}
                >
                  Dar de baja
                </Btn>
              </div>
            </div>
          </div>
        </div>);
}
