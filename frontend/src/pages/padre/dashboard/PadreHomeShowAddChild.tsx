import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Plus, X, Check } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreHome>, "setShowAddChild" | "addChildDone" | "setAddChildDone" | "setNewChildName" | "setNewChildAge" | "newChildName" | "newChildAge" | "setHomeToast">;
export function PadreHomeShowAddChild({ setShowAddChild, addChildDone, setAddChildDone, setNewChildName, setNewChildAge, newChildName, newChildAge, setHomeToast }: Props) {
return (<div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            fontFamily: '"Nunito", system-ui, sans-serif',
          }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddChild(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">
                {addChildDone
                  ? "¡Hijo agregado!"
                  : "Agregar hijo"}
              </h2>
              <button
                onClick={() => {
                  setShowAddChild(false);
                  setAddChildDone(false);
                  setNewChildName("");
                  setNewChildAge("");
                }}
                className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {!addChildDone ? (
                <>
                  <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                    Ingresa los datos de tu hijo/a para comenzar
                    a personalizar su experiencia.
                  </p>
                  <div className="flex flex-col gap-4 mb-5">
                    <Inp
                      label="Nombre del niño/a"
                      placeholder="Ej. Lucas"
                      value={newChildName}
                      onChange={setNewChildName}
                    />
                    <Inp
                      label="Edad"
                      placeholder="Ej. 5"
                      value={newChildAge}
                      onChange={setNewChildAge}
                    />
                    <div>
                      <label className="block text-sm font-bold text-[#1C1135] mb-2">
                        Área de apoyo principal
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Lenguaje",
                          "Articulación",
                          "Fonología",
                          "Comprensión",
                          "Fluidez",
                        ].map((a) => (
                          <button
                            key={a}
                            className="px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all hover:border-violet-400 hover:bg-violet-50"
                            style={{ borderColor: B.border }}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Btn
                    variant="primary"
                    className="w-full justify-center"
                    disabled={!newChildName || !newChildAge}
                    onClick={() => setAddChildDone(true)}
                  >
                    <Plus size={14} /> Agregar hijo
                  </Btn>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
                    style={{ background: B.successLight }}
                  >
                    🎉
                  </div>
                  <p className="font-extrabold text-xl text-[#1C1135] mb-2">
                    {newChildName} fue agregado
                  </p>
                  <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                    ASHI personalizará las recomendaciones
                    basadas en el perfil de {newChildName}.
                  </p>
                  <Btn
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setShowAddChild(false);
                      setAddChildDone(false);
                      setNewChildName("");
                      setNewChildAge("");
                      setHomeToast(
                        `${newChildName} agregado exitosamente`,
                      );
                    }}
                  >
                    <Check size={14} /> Listo
                  </Btn>
                </div>
              )}
            </div>
          </div>
        </div>);
}
