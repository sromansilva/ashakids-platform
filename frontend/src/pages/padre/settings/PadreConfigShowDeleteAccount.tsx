import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowDeleteAccount" | "setDeleteConfirm" | "deleteConfirm" | "showToast">;
export function PadreConfigShowDeleteAccount({ setShowDeleteAccount, setDeleteConfirm, deleteConfirm, showToast }: Props) {
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteAccount(false);
              setDeleteConfirm("");
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "#FEF2F2" }}
            >
              ⚠️
            </div>
            <h2 className="font-extrabold text-center text-red-700 text-lg mb-2">
              Eliminar cuenta
            </h2>
            <p className="text-sm text-center text-[#7C6F9A] font-medium mb-4">
              Esta acción es{" "}
              <strong className="text-red-600">
                permanente e irreversible
              </strong>
              . Perderás todos tus datos.
            </p>
            <div className="mb-4">
              <Inp
                label='Escribe "ELIMINAR" para confirmar'
                placeholder="ELIMINAR"
                value={deleteConfirm}
                onChange={setDeleteConfirm}
              />
            </div>
            <div className="flex gap-3">
              <Btn
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirm("");
                }}
              >
                Cancelar
              </Btn>
              <Btn
                variant="danger"
                className="flex-1 justify-center"
                disabled={deleteConfirm !== "ELIMINAR"}
                onClick={() =>
                  showToast("Solicitud de eliminación enviada")
                }
              >
                Eliminar cuenta
              </Btn>
            </div>
          </div>
        </div>);
}
