import { useState } from "react";
import { AlertTriangle, Loader2, MessageCircle, XCircle } from "lucide-react";
import type { SolicitudAcceso } from "@/modules/admin/infrastructure/adminService";
import { AdminFormDialog, adminFormInputClass, adminFormLabelClass } from "../AdminFormDialog";

interface RechazoSolicitudDialogProps {
  solicitud: SolicitudAcceso;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

export function RechazoSolicitudDialog({
  solicitud,
  busy,
  error,
  onClose,
  onConfirm,
}: RechazoSolicitudDialogProps) {
  const [motivo, setMotivo] = useState("");
  const motivoTrimmed = motivo.trim();
  const isValidMotivo = motivoTrimmed.length >= 10 && motivoTrimmed.length <= 300;

  return (
    <AdminFormDialog
      ariaLabelledBy="dialog-rechazar-solicitud"
      eyebrow="Solicitud de acceso por WhatsApp"
      title={`Rechazar solicitud de ${solicitud.nombres}`}
      subtitle="Indica el motivo del rechazo para informar a la familia."
      icon={XCircle}
      maxWidth="max-w-xl"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E8E5F4] bg-white px-5 text-sm font-bold text-[#615274] transition hover:bg-[#F8F7FC] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy || !isValidMotivo}
            onClick={() => onConfirm(motivoTrimmed)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Rechazar solicitud
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900">
          <MessageCircle size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <p>
            La familia recibirá este motivo por correo y, si escribió en las últimas 24 horas, también por
            WhatsApp.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="motivo-rechazo" className={adminFormLabelClass}>
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <p className="mt-0.5 text-xs font-medium text-[#615274]">
            Mínimo 10 caracteres, máximo 300. Sé claro y respetuoso con la familia.
          </p>
          <textarea
            id="motivo-rechazo"
            required
            rows={4}
            maxLength={300}
            disabled={busy}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ejemplo: No pudimos verificar la identidad con el DNI proporcionado."
            className={`${adminFormInputClass} min-h-[100px] resize-none`}
          />
          <div className="mt-1.5 flex justify-between text-xs font-bold text-[#9E95B7]">
            <span>
              {motivoTrimmed.length > 0 && motivoTrimmed.length < 10 && (
                <span className="text-amber-700">
                  Mínimo 10 caracteres (faltan {10 - motivoTrimmed.length})
                </span>
              )}
            </span>
            <span className={motivo.length > 300 ? "font-black text-red-600" : ""}>
              {motivo.length}/300
            </span>
          </div>
        </div>
      </div>
    </AdminFormDialog>
  );
}
