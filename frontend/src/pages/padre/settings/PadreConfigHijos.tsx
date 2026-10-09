import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Plus, Edit, Trash2 } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { useFamilyPatients } from "@/hooks/useFamilyPatients";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";

type Props = Pick<ReturnType<typeof usePadreConfig>, "padrePlan" | "childList" | "setShowPlanUpgradeModal" | "setShowAddChildModal" | "setEditChild" | "setDeleteChild">;
export function PadreConfigHijos({ childList, setShowAddChildModal, setEditChild, setDeleteChild }: Props) {
const { query } = useFamilyPatients();
return (<div className="flex flex-col gap-5">
                <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
                {!query.isPending && !query.error && <>
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-[#1C1135] text-lg">
                    Mis hijos ({childList.length})
                  </h2>
                  <Btn variant="secondary" onClick={() => setShowAddChildModal(true)}>
                    <Plus size={13} /> Añadir hijo
                  </Btn>
                </div>
                {childList.length === 0 ? (
                  <p className="text-base text-[#4B4264]">Sin hijos registrados. Añade un perfil para comenzar.</p>
                ) : (
                  childList.map((k) => (
                    <div
                      key={k.id}
                      className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 p-4 rounded-2xl border border-[#E8E5F4] bg-white"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: (k as any).color || B.violetLight }}
                      >
                        {(k as any).av || (k as any).emoji || k.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-[#1C1135] break-words">
                          {k.name} {k.surname}
                        </p>
                        <p className="text-xs text-[#7C6F9A] font-medium">
                          {k.age} años
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-xl"
                          style={{
                            background: B.successLight,
                            color: B.success,
                          }}
                        >
                          Activo
                        </span>
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditChild(k)}
                        >
                          <Edit size={12} /> Editar
                        </Btn>
                        <button
                          onClick={() => setDeleteChild(k)}
                          aria-label={`Dar de baja a ${k.name} ${k.surname}`}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </>}
              </div>);
}
