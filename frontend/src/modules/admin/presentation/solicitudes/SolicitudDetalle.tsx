import { CheckCircle2, Info, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Av } from "@/shared/presentation/components/common/Av";
import type { SolicitudAcceso } from "@/modules/admin/infrastructure/adminService";
import { DniVerificacionBadge } from "./DniVerificacionBadge";
import { AVISO_TEXTO, fecha, iniciales, type DniFeedback } from "./solicitudesFormat";

interface SolicitudDetalleProps {
  s: SolicitudAcceso;
  dniFeedback?: DniFeedback;
  confirmingAprobar: boolean;
  busy: boolean;
  verificandoDni: boolean;
  onAskAprobar: () => void;
  onCancelAprobar: () => void;
  onConfirmAprobar: () => void;
  onOpenRejectDialog: () => void;
  onVerificarDni: () => void;
  onReenviar: () => void;
  reenviando: boolean;
}

export function SolicitudDetalle({
  s,
  dniFeedback,
  confirmingAprobar,
  busy,
  verificandoDni,
  onAskAprobar,
  onCancelAprobar,
  onConfirmAprobar,
  onOpenRejectDialog,
  onVerificarDni,
  onReenviar,
  reenviando,
}: SolicitudDetalleProps) {
  const campos = [
    { l: "Nombres", v: s.nombres },
    { l: "Apellidos", v: s.apellidos },
    { l: "Correo", v: s.email },
    { l: "Teléfono (WhatsApp)", v: s.telefono ?? "Borrado por retención" },
    { l: "Fecha de solicitud", v: fecha(s.creado_en) },
  ];

  const estadoDni = dniFeedback?.estado ?? s.dni_verificacion_estado;
  const fechaDni = dniFeedback?.verificado_en ?? s.dni_verificado_en;
  const nombreReniecDni = dniFeedback?.nombre_reniec;

  return (
    <div className="rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <Av initials={iniciales(s)} color="#6B46FE" size="xl" />
        <div className="min-w-0">
          <h2 className="break-words text-xl font-extrabold text-[#1C1135]">
            {s.nombres} {s.apellidos}
          </h2>
          <p className="text-sm font-medium text-[#615274]">
            Solicitud #{s.id_solicitud} ·{" "}
            {s.estado === "PROCESANDO"
              ? "Procesando"
              : s.estado.charAt(0) + s.estado.slice(1).toLowerCase()}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {/* Campo DNI con botón de verificación e insignia */}
        <div className="min-w-0 rounded-2xl bg-[#F8F7FC] p-3 sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#9E95B7]">DNI</p>
              <p className="text-base font-extrabold text-[#1C1135]">{s.dni ?? "Borrado por retención"}</p>
            </div>
            {s.estado === "PENDIENTE" && (
              <button
                type="button"
                disabled={verificandoDni}
                onClick={onVerificarDni}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E5F4] bg-white px-3 py-1.5 text-xs font-extrabold text-[#6B46FE] shadow-sm transition hover:bg-[#EDE9FE] disabled:opacity-60"
              >
                {verificandoDni ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                {verificandoDni ? "Verificando DNI…" : "Verificar DNI"}
              </button>
            )}
          </div>
          {estadoDni && (
            <div className="mt-2.5 border-t border-[#E8E5F4] pt-2" aria-live="polite">
              <DniVerificacionBadge estado={estadoDni} verificadoEn={fechaDni} nombreReniec={nombreReniecDni} />
            </div>
          )}
        </div>

        {campos.map((c) => (
          <div key={c.l} className="min-w-0 rounded-2xl bg-[#F8F7FC] p-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#9E95B7]">{c.l}</p>
            <p className="break-words text-sm font-bold text-[#1C1135]">{c.v}</p>
          </div>
        ))}
      </div>

      {s.estado === "PENDIENTE" && !confirmingAprobar && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onAskAprobar}
            className="flex-1 rounded-2xl bg-[#6B46FE] py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5833EA]"
          >
            Aprobar
          </button>
          <button
            type="button"
            onClick={onOpenRejectDialog}
            className="flex-1 rounded-2xl border-2 border-red-600 py-2.5 text-sm font-extrabold text-red-600 transition hover:bg-red-50"
          >
            Rechazar
          </button>
        </div>
      )}

      {s.estado === "PENDIENTE" && confirmingAprobar && (
        <div
          role="alertdialog"
          aria-label="Confirmar aprobación"
          className="rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4"
        >
          <p className="mb-1 flex items-center gap-2 text-sm font-extrabold text-[#1C1135]">
            <Info size={16} className="text-[#6B46FE]" />
            ¿Aprobar la solicitud de {s.nombres}?
          </p>
          <p className="mb-3 text-sm font-medium text-[#615274]">
            Se creará la cuenta familiar y se enviará el enlace de activación al correo registrado.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirmAprobar}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#6B46FE] py-2.5 text-sm font-extrabold text-white hover:bg-[#5833EA] disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              Confirmar aprobación
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancelAprobar}
              className="flex-1 rounded-2xl border border-[#E8E5F4] bg-white py-2.5 text-sm font-extrabold text-[#615274] hover:bg-[#F8F7FC] disabled:opacity-60"
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {s.estado === "PROCESANDO" && (
        <p className="rounded-2xl bg-[#F8F7FC] p-3 text-sm font-bold text-[#615274]">
          Otra revisión está procesando esta solicitud. Actualiza en unos segundos.
        </p>
      )}

      {s.estado === "APROBADA" && (
        <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          <p className="flex items-center gap-2 font-extrabold text-green-900">
            <CheckCircle2 size={16} /> Aprobada el {fecha(s.revisado_en)}
          </p>
          {s.correo_estado === "ENVIADO" ? (
            <p className="text-xs text-green-800">El enlace de activación se envió al correo.</p>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
              <p className="font-bold">El correo de activación no salió ({s.correo_estado ?? "sin dato"}).</p>
              <p className="mt-0.5">Usa el reenvío de activación para enviar el enlace a la familia.</p>
            </div>
          )}
          {s.id_usuario_creado && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={reenviando}
                onClick={onReenviar}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition disabled:opacity-60 ${
                  s.correo_estado !== "ENVIADO"
                    ? "bg-[#6B46FE] text-white shadow-sm hover:bg-[#5833EA]"
                    : "border border-[#E8E5F4] bg-white text-[#615274] hover:bg-[#F8F7FC]"
                }`}
              >
                {reenviando && <Loader2 size={13} className="animate-spin" />}
                {reenviando ? "Enviando..." : "Reenviar activación"}
              </button>
              {s.correo_estado !== "ENVIADO" && (
                <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-[#6B46FE]">
                  Acción recomendada
                </span>
              )}
            </div>
          )}
          {s.aviso_whatsapp_estado && (
            <p className="text-xs text-[#615274]">
              {AVISO_TEXTO[s.aviso_whatsapp_estado] ?? `Aviso por WhatsApp: ${s.aviso_whatsapp_estado}.`}
            </p>
          )}
        </div>
      )}

      {s.estado === "RECHAZADA" && (
        <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          <p className="flex items-center gap-2 font-extrabold text-red-900">
            <XCircle size={16} /> Rechazada el {fecha(s.revisado_en)}
          </p>
          {s.motivo_rechazo && (
            <div className="rounded-xl border border-red-200 bg-white/70 p-3 text-sm">
              <p className="text-xs font-extrabold uppercase tracking-wider text-red-700">Motivo del rechazo</p>
              <p className="mt-0.5 text-sm font-bold text-[#1C1135]">{s.motivo_rechazo}</p>
            </div>
          )}
          {s.aviso_whatsapp_estado && (
            <p className="text-xs text-red-700">
              {AVISO_TEXTO[s.aviso_whatsapp_estado] ?? `Aviso por WhatsApp: ${s.aviso_whatsapp_estado}.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
