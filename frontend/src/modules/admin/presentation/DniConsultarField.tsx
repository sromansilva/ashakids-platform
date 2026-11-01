import { useState } from "react";
import { IdCard, Loader2, Search, ShieldCheck, AlertTriangle, ChevronDown, Info } from "lucide-react";
import { identityService } from "../infrastructure/identityService";
import type { TipoDocumento } from "@/modules/auth/domain/auth";

interface DniConsultarFieldProps {
  id: string;
  value: string;
  tipoDocumento?: TipoDocumento;
  onTipoDocumentoChange?: (tipo: TipoDocumento) => void;
  disabled?: boolean;
  required?: boolean;
  inputClass: string;
  labelClass: string;
  onChange: (val: string) => void;
  onSuccess: (data: { nombres: string; apellidos: string; nombreCompleto: string }) => void;
}

export function DniConsultarField({
  id,
  value,
  tipoDocumento = "DNI",
  onTipoDocumentoChange,
  disabled = false,
  required = false,
  inputClass,
  labelClass,
  onChange,
  onSuccess,
}: DniConsultarFieldProps) {
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "idle" | "success" | "error"; message?: string }>({ status: "idle" });

  const isDni = tipoDocumento === "DNI";
  const isCe = tipoDocumento === "CE";

  async function handleConsultar() {
    const cleanDni = value.trim();
    if (!/^\d{8}$/.test(cleanDni)) {
      setFeedback({ status: "error", message: "El DNI debe tener 8 dígitos numéricos." });
      return;
    }
    setSearching(true);
    setFeedback({ status: "idle" });
    try {
      const res = await identityService.consultarDni(cleanDni);
      if (res.success && res.data) {
        onSuccess({
          nombres: res.data.nombres,
          apellidos: res.data.apellidos,
          nombreCompleto: res.data.nombreCompleto,
        });
        setFeedback({
          status: "success",
          message: `✓ Datos de ${res.data.nombreCompleto} obtenidos de RENIEC`,
        });
      } else {
        setFeedback({
          status: "error",
          message: res.message || "No se encontraron datos para el DNI ingresado.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al consultar RENIEC.";
      setFeedback({ status: "error", message: msg });
    } finally {
      setSearching(false);
    }
  }

  const documentLabel = isDni
    ? "Número de DNI"
    : isCe
      ? "Número de Carné de Extranjería"
      : "Número de Pasaporte";

  const placeholder = isDni ? "12345678" : isCe ? "000123456" : "A12345678";
  const maxLength = isDni ? 8 : isCe ? 9 : 12;

  return (
    <div>
      <div
        className={`grid gap-3 sm:items-end ${
          isDni ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto]" : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
        }`}
      >
        <label htmlFor={`${id}-type`} className={labelClass}>
          Tipo de documento
          <span className="relative mt-1.5 block">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" size={18} />
            <select
              id={`${id}-type`}
              disabled={disabled || searching}
              value={tipoDocumento}
              onChange={(e) => {
                const next = e.target.value as TipoDocumento;
                onTipoDocumentoChange?.(next);
                setFeedback({ status: "idle" });
              }}
              className={`${inputClass} appearance-none pl-10 pr-9 cursor-pointer`}
            >
              <option value="DNI">DNI (Perú)</option>
              <option value="CE">Carné de Extranjería (CE)</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" size={16} />
          </span>
        </label>

        <label htmlFor={id} className={labelClass}>
          {documentLabel} {required && "*"}
          <input
            id={id}
            required={required}
            minLength={isDni ? 8 : isCe ? 4 : 6}
            maxLength={maxLength}
            pattern={isDni ? "[0-9]{8}" : undefined}
            inputMode={isDni ? "numeric" : "text"}
            disabled={disabled || searching}
            value={value}
            onChange={(event) => {
              const raw = event.target.value;
              const cleaned = isDni ? raw.replace(/\D/g, "") : raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
              onChange(cleaned);
              if (feedback.status !== "idle") setFeedback({ status: "idle" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isDni && value.length === 8) {
                e.preventDefault();
                void handleConsultar();
              }
            }}
            placeholder={placeholder}
            className={`${inputClass} mt-1.5 text-base font-semibold`}
          />
        </label>

        {isDni && (
          <button
            type="button"
            disabled={disabled || searching || value.length !== 8}
            onClick={() => void handleConsultar()}
            title={value.length === 8 ? "Consultar RENIEC" : "Ingresa 8 dígitos para consultar"}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition sm:mb-0 ${
              value.length === 8 && !searching
                ? "bg-violet-700 text-white shadow-sm hover:bg-violet-800 cursor-pointer active:scale-[.98]"
                : "bg-[#EDE9FE] text-violet-700 opacity-60 cursor-not-allowed"
            }`}
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            <span>{searching ? "Consultando…" : "Consultar RENIEC"}</span>
          </button>
        )}
      </div>

      {isDni && feedback.status === "success" && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {isDni && feedback.status === "error" && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {!isDni && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <Info size={16} className="text-violet-600 shrink-0" />
          <span>
            {isCe
              ? "Titular con Carné de Extranjería: ingresa tus nombres y apellidos manualmente."
              : "Titular con Pasaporte: ingresa tus nombres y apellidos manualmente."}
          </span>
        </div>
      )}
    </div>
  );
}
