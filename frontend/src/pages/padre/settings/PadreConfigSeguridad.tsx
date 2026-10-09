import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Trash2, Lock } from "lucide-react";
import { Btn } from "@/components/common/Btn";
import { Inp } from "@/components/common/Inp";

type Props = Pick<ReturnType<typeof usePadreConfig>, "pwCurrent" | "setPwCurrent" | "pwNew" | "setPwNew" | "pwConfirm" | "setPwConfirm" | "setShow2FA" | "setShowDeleteAccount" | "showToast" | "pwSaving" | "handleSavePassword">;
export function PadreConfigSeguridad({ pwCurrent, setPwCurrent, pwNew, setPwNew, pwConfirm, setPwConfirm, setShow2FA, setShowDeleteAccount, showToast: _showToast, pwSaving, handleSavePassword }: Props) {
return (<div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">
                  Seguridad
                </h2>
                <div className="flex flex-col gap-4">
                  <Inp
                    label="Contraseña actual"
                    type="password"
                    placeholder="Tu contraseña actual"
                    value={pwCurrent}
                    onChange={setPwCurrent}
                  />
                  <Inp
                    label="Nueva contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={pwNew}
                    onChange={setPwNew}
                  />
                  <Inp
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    value={pwConfirm}
                    onChange={setPwConfirm}
                  />
                  {pwNew &&
                    pwConfirm &&
                    pwNew !== pwConfirm && (
                      <p className="text-xs font-bold text-red-500">
                        Las contraseñas no coinciden.
                      </p>
                    )}
                </div>
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-[#1C1135] mb-0.5">
                        Autenticación en dos pasos
                      </p>
                      <p className="text-xs text-[#7C6F9A] font-medium">
                        Protege tu cuenta con un código
                        adicional al iniciar sesión.
                      </p>
                    </div>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() => setShow2FA(true)}
                    >
                      <Lock size={12} /> Activar 2FA
                    </Btn>
                  </div>
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-red-700 mb-0.5">
                        Eliminar cuenta
                      </p>
                      <p className="text-xs text-red-600 font-medium">
                        Esta acción es permanente e
                        irreversible.
                      </p>
                    </div>
                    <Btn
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      <Trash2 size={12} /> Eliminar
                    </Btn>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Btn
                    variant="cta"
                    disabled={
                      !pwCurrent ||
                      !pwNew ||
                      !pwConfirm ||
                      pwNew !== pwConfirm ||
                      pwSaving
                    }
                    onClick={() => {
                      void handleSavePassword();
                    }}
                  >
                    <Lock size={14} /> {pwSaving ? "Guardando..." : "Cambiar contraseña"}
                  </Btn>
                </div>
              </div>);
}
