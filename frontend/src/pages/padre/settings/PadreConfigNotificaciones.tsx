import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreConfig>, "notifs" | "toggleN" | "showToast">;
export function PadreConfigNotificaciones({ notifs, toggleN, showToast }: Props) {
return (<div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Notificaciones
                </h2>
                <div className="flex flex-col gap-3">
                  {(
                    [
                      {
                        key: "citas",
                        label: "Confirmación de citas",
                        desc: "Cuando se confirma o cambia una cita",
                      },
                      {
                        key: "recordatorios",
                        label: "Recordatorios de sesión",
                        desc: "30 minutos antes de cada sesión",
                      },
                      {
                        key: "reportes",
                        label: "Nuevo reporte disponible",
                        desc: "Cuando la terapeuta sube un reporte clínico",
                      },
                      {
                        key: "mensajes",
                        label: "Nuevos mensajes",
                        desc: "Mensajes de la terapeuta o del equipo ASHAKids",
                      },
                      {
                        key: "progreso",
                        label: "Actualizaciones de progreso",
                        desc: "Logros e hitos alcanzados por tu hijo",
                      },
                      {
                        key: "promo",
                        label: "Promociones y novedades",
                        desc: "Ofertas especiales y nuevas funcionalidades",
                      },
                    ] as {
                      key: keyof typeof notifs;
                      label: string;
                      desc: string;
                    }[]
                  ).map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E5F4]"
                    >
                      <div>
                        <p className="font-extrabold text-sm text-[#1C1135]">
                          {n.label}
                        </p>
                        <p className="text-xs text-[#7C6F9A] font-medium">
                          {n.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleN(n.key)}
                        className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0 ml-4"
                        style={{
                          background: notifs[n.key]
                            ? B.violet
                            : "#D1D5DB",
                          justifyContent: notifs[n.key]
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow-sm block transition-all" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    onClick={() =>
                      showToast(
                        "Preferencias de notificación guardadas",
                      )
                    }
                  >
                    <CheckCircle size={14} /> Guardar
                    preferencias
                  </Btn>
                </div>
              </div>);
}
