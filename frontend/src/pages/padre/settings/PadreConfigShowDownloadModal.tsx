import type { usePadreConfig } from "@/pages/padre/settings/usePadreConfig";
import { Download } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShowDownloadModal" | "setDownloadSent" | "downloadSent">;
export function PadreConfigShowDownloadModal({ setShowDownloadModal, setDownloadSent, downloadSent }: Props) {
return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDownloadModal(false);
              setDownloadSent(false);
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            {!downloadSent ? (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: B.violetLight }}
                >
                  📦
                </div>
                <h2 className="font-extrabold text-[#1C1135] text-lg mb-2">
                  Solicitar mis datos
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Recibirás un enlace de descarga en{" "}
                  <strong>laura.gomez@email.com</strong> en un
                  plazo de 72 horas.
                </p>
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setDownloadSent(true)}
                >
                  <Download size={14} /> Confirmar solicitud
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
                  Solicitud enviada
                </h2>
                <p className="text-sm text-[#7C6F9A] font-medium mb-5">
                  Recibirás un correo en hasta 72 horas con el
                  enlace para descargar tus datos.
                </p>
                <Btn
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadSent(false);
                  }}
                >
                  Entendido
                </Btn>
              </>
            )}
          </div>
        </div>);
}
