import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Upload, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowPhotoModal" | "selectedAvatar" | "nombre" | "setNombre" | "email" | "setEmail" | "tel" | "setTel" | "ciudad" | "setCiudad" | "showToast" | "setShowPwConfirmModal">;
export function PadreConfigCuenta({ setShowPhotoModal, selectedAvatar, nombre, setNombre, email, setEmail, tel, setTel, ciudad, setCiudad, showToast, setShowPwConfirmModal }: Props) {
return (<div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Datos de la cuenta
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: B.violetLight }}
                    onClick={() => setShowPhotoModal(true)}
                  >
                    {selectedAvatar}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[#1C1135]">
                      {nombre}
                    </p>
                    <p className="text-xs text-[#7C6F9A] font-medium mb-2">
                      Avatar de perfil
                    </p>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPhotoModal(true)}
                    >
                      <Upload size={12} /> Cambiar foto
                    </Btn>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Inp
                    label="Nombre completo"
                    value={nombre}
                    onChange={setNombre}
                  />
                  <Inp
                    label="Correo electrónico"
                    value={email}
                    onChange={setEmail}
                  />
                  <Inp
                    label="Teléfono"
                    value={tel}
                    onChange={setTel}
                  />
                  <Inp
                    label="Ciudad"
                    value={ciudad}
                    onChange={setCiudad}
                  />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                    Código de acceso
                  </p>
                  <div className="flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3">
                    <span className="font-extrabold text-[#1C1135]">
                      P1234
                    </span>
                    <span className="text-xs text-[#7C6F9A] font-medium">
                      — Comparte con tu terapeuta para vincular
                      tu cuenta
                    </span>
                    <button
                      className="ml-auto text-xs font-bold hover:underline"
                      style={{ color: B.violet }}
                      onClick={() =>
                        showToast(
                          "Código copiado al portapapeles",
                        )
                      }
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    onClick={() => setShowPwConfirmModal(true)}
                  >
                    <CheckCircle size={14} /> Guardar cambios
                  </Btn>
                </div>
              </div>);
}
