import { useState } from "react";
import { Building2, Loader2, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { identityService, type RucData } from "../infrastructure/identityService";

interface RucConsultarFieldProps {
  id: string;
  value: string;
  disabled?: boolean;
  inputClass: string;
  labelClass: string;
  onChange: (val: string) => void;
  onSuccess: (data: RucData) => void;
}

export function RucConsultarField({
  id,
  value,
  disabled = false,
  inputClass,
  labelClass,
  onChange,
  onSuccess,
}: RucConsultarFieldProps) {
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: "idle" | "success" | "error";
    data?: RucData;
    message?: string;
  }>({ status: "idle" });

  async function handleConsultar() {
    const cleanRuc = value.trim();
    if (!/^\d{11}$/.test(cleanRuc)) {
      setFeedback({ status: "error", message: "El RUC debe tener exactamente 11 dígitos numéricos." });
      return;
    }

    setSearching(true);
    setFeedback({ status: "idle" });
    try {
      const res = await identityService.consultarRuc(cleanRuc);
      if (res.success && res.data) {
        onSuccess(res.data);
        setFeedback({
          status: "success",
          data: res.data,
          message: `✓ SUNAT: ${res.data.razonSocial}`,
        });
      } else {
        setFeedback({
          status: "error",
          message: res.message || "No se encontraron datos en SUNAT para el RUC ingresado.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al consultar SUNAT.";
      setFeedback({ status: "error", message: msg });
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label htmlFor={id} className={labelClass}>
          RUC (Opcional - Facturación / Recibos por Honorarios)
          <span className="relative mt-1.5 block">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" size={18} />
            <input
              id={id}
              minLength={11}
              maxLength={11}
              pattern="[0-9]{11}"
              inputMode="numeric"
              disabled={disabled || searching}
              value={value}
              onChange={(e) => {
                onChange(e.target.value.replace(/\D/g, ""));
                if (feedback.status !== "idle") setFeedback({ status: "idle" });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.length === 11) {
                  e.preventDefault();
                  void handleConsultar();
                }
              }}
              placeholder="10708543210 ó 20100070970"
              className={`${inputClass} pl-10 text-base font-semibold`}
            />
          </span>
        </label>

        <button
          type="button"
          disabled={disabled || searching || value.length !== 11}
          onClick={() => void handleConsultar()}
          title={value.length === 11 ? "Consultar SUNAT" : "Ingresa 11 dígitos para consultar SUNAT"}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition sm:mb-0 ${
            value.length === 11 && !searching
              ? "bg-violet-700 text-white shadow-sm hover:bg-violet-800 cursor-pointer active:scale-[.98]"
              : "bg-[#EDE9FE] text-violet-700 opacity-60 cursor-not-allowed"
          }`}
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          <span>{searching ? "Consultando…" : "Consultar SUNAT"}</span>
        </button>
      </div>

      {feedback.status === "success" && feedback.data && (
        <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{feedback.data.razonSocial}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-700">
            <span className="rounded bg-emerald-100 px-1.5 py-0.5">Estado: {feedback.data.estado}</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5">Condición: {feedback.data.condicion}</span>
            {feedback.data.direccion && (
              <span className="truncate">Dirección: {feedback.data.direccion}</span>
            )}
          </div>
        </div>
      )}

      {feedback.status === "error" && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}

