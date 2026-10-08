import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { CheckCircle, Shield } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShow2FA" | "setTwoFADone" | "twoFADone" | "showToast">;
export function PadreConfigShow2FA({ setShow2FA, setTwoFADone, twoFADone, showToast }: Props) {
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShow2FA(false);
              setTwoFADone(false);
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            {!twoFADone ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.violetLight }}
                >
                  🔐
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  Activar autenticación 2FA
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-4">
                  Escanea este código QR con una app de
                  autenticación como Google Authenticator o
                  Authy.
                </p>
                <div
                  className="w-32 h-32 mx-auto rounded-2xl border-2 border-[#E8E5F4] flex items-center justify-center mb-5"
                  style={{ background: "#F5F3FF" }}
                >
                  <div className="grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm"
                        style={{
                          background:
                            Math.random() > 0.5
                              ? "#7C3AED"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-bold text-[#7C6F9A] mb-5">
                  Código manual:{" "}
                  <strong className="text-[#1C1135]">
                    ASHA-2FA-X9K2
                  </strong>
                </p>
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setTwoFADone(true)}
                >
                  <Shield size={14} /> Confirmar activación
                </Btn>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.successLight }}
                >
                  ✅
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  2FA activado
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Tu cuenta ahora está protegida con
                  autenticación de dos factores.
                </p>
                <Btn
                  variant="cta"
                  className="w-full justify-center"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFADone(false);
                    showToast("Autenticación 2FA activada");
                  }}
                >
                  <CheckCircle size={14} /> Listo
                </Btn>
              </>
            )}
          </div>
        </div>);
}
