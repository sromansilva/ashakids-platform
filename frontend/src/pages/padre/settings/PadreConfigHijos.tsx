import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Plus, Edit, Trash2 } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { EmptyState } from "@/components/common/EmptyState";
import { useFamilyPatients } from "@/hooks/useFamilyPatients";
import { RemoteFeedback } from "@/components/common/RemoteFeedback";

type Props = Pick<ReturnType<typeof usePadreConfig>, "padrePlan" | "childList" | "setShowPlanUpgradeModal" | "setShowAddChildModal" | "setEditChild" | "setDeleteChild">;
export function PadreConfigHijos({ padrePlan, childList, setShowPlanUpgradeModal, setShowAddChildModal, setEditChild, setDeleteChild }: Props) {
const { query } = useFamilyPatients();
return (<div className="flex flex-col gap-5">
                <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
                {padrePlan === "exploracion" && (
                  <div className="rounded-2xl p-4 flex items-start gap-3 border" style={{ background: B.warningLight, borderColor: B.warning + "40" }}>
                    <span className="text-lg flex-shrink-0">ℹ️</span>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: B.warning }}>Plan Exploración — 1 perfil infantil</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: "#92400E" }}>Con el Plan Familia puedes añadir perfiles ilimitados y acceder a todas las funciones.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-[#1C1135] text-lg">
                    Mis hijos ({childList.length})
                  </h2>
                  <Btn variant="secondary" size="sm" onClick={() => padrePlan === "exploracion" ? setShowPlanUpgradeModal(true) : setShowAddChildModal(true)}>
                    <Plus size={13} /> Añadir hijo
                  </Btn>
                </div>
                {childList.length === 0 ? (
                  <EmptyState
                    icon="👧"
                    title="Sin hijos registrados"
                    desc="Agrega el perfil de tu hijo para comenzar."
                    action="Agregar hijo"
                    onAction={() => setShowAddChildModal(true)}
                  />
                ) : (
                  (padrePlan === "exploracion" ? childList.slice(0, 1) : childList).map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[#E8E5F4] bg-white"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: (k as any).color || B.violetLight }}
                      >
                        {(k as any).av || (k as any).emoji || k.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-[#1C1135]">
                          {k.name}
                        </p>
                        <p className="text-xs text-[#7C6F9A] font-medium">
                          {(k as any).age || ""} {(k as any).specialty ? `· ${(k as any).specialty}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>);
}
