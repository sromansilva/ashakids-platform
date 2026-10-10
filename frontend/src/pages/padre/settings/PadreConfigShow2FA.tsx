import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
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
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 bg-violet-100">🔐</div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">Autenticación en dos pasos</h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-4">Esta función todavía no está disponible. No se generó un código, no se envió correo y no se activó MFA.</p>
                <p className="text-xs font-bold text-[#7C6F9A] mb-5">No se ha creado un segundo factor para esta cuenta.</p>
                <Btn variant="secondary" className="w-full justify-center" onClick={() => setShow2FA(false)}>Cerrar</Btn>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "#FEF2F2" }}
                >
                  ✅
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">Función no disponible</h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  No se modificó la seguridad de tu cuenta.
                </p>
                <Btn
                  variant="cta"
                  className="w-full justify-center"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFADone(false);
                    showToast("2FA todavía no está disponible.");
                  }}
                >
                  Listo
                </Btn>
              </>
            )}
          </div>
        </div>);
}
