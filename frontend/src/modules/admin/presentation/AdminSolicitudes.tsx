import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, UserCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  SOLICITUDES_QUERY_KEY,
  type SolicitudAcceso,
} from "@/modules/admin/infrastructure/adminService";
import { SolicitudCard } from "./solicitudes/SolicitudCard";
import { SolicitudDetalle } from "./solicitudes/SolicitudDetalle";
import { RechazoSolicitudDialog } from "./solicitudes/RechazoSolicitudDialog";
import {
  describirResultado,
  type DniFeedback,
  type Resultado,
} from "./solicitudes/solicitudesFormat";

type Filtro = "PENDIENTE" | "APROBADA" | "RECHAZADA";

const FILTROS: Array<{ key: Filtro; label: string; tone: string }> = [
  { key: "PENDIENTE", label: "Pendientes", tone: "#D97706" },
  { key: "APROBADA", label: "Aprobadas", tone: "#16A34A" },
  { key: "RECHAZADA", label: "Rechazadas", tone: "#DC2626" },
];

const TONE_CLASS: Record<Resultado["tone"], string> = {
  ok: "border-green-200 bg-green-50 text-green-800",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-800",
};

export function AdminSolicitudes() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<Filtro>("PENDIENTE");
  const [items, setItems] = useState<SolicitudAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Confirmación inline para aprobar
  const [confirmingAprobar, setConfirmingAprobar] = useState(false);

  // Diálogo modal para rechazar con motivo
  const [rejectingSolicitud, setRejectingSolicitud] = useState<SolicitudAcceso | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [verificandoDni, setVerificandoDni] = useState(false);
  const [dniFeedbackMap, setDniFeedbackMap] = useState<Record<number, DniFeedback>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getSolicitudesAcceso();
      setItems(Array.isArray(res?.items) ? res.items : []);
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_QUERY_KEY });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const counts = useMemo(
    () => ({
      PENDIENTE: items.filter((i) => i.estado === "PENDIENTE" || i.estado === "PROCESANDO").length,
      APROBADA: items.filter((i) => i.estado === "APROBADA").length,
      RECHAZADA: items.filter((i) => i.estado === "RECHAZADA").length,
    }),
    [items],
  );

  const visibles = useMemo(
    () =>
      items.filter((i) =>
        filtro === "PENDIENTE" ? i.estado === "PENDIENTE" || i.estado === "PROCESANDO" : i.estado === filtro,
      ),
    [items, filtro],
  );
  const seleccionada = visibles.find((i) => i.id_solicitud === selectedId) ?? null;

  const cambiarFiltro = (f: Filtro) => {
    setFiltro(f);
    setSelectedId(null);
    setConfirmingAprobar(false);
    setRejectingSolicitud(null);
  };

  async function reenviar(s: SolicitudAcceso) {
    if (!s.id_usuario_creado) return;
    setReenviando(true);
    setResultado(null);
    try {
      const res = await adminService.reenviarActivacion(s.id_usuario_creado);
      setResultado({
        tone: res.correo_estado === "ENVIADO" ? "ok" : "warn",
        lines: [
          res.correo_estado === "ENVIADO"
            ? "Correo de activación enviado."
            : `Correo de activación: ${res.correo_estado}.`,
        ],
      });
      if (res.correo_estado === "ENVIADO") {
        setItems((current) =>
          current.map((item) => (item.id_solicitud === s.id_solicitud ? { ...item, correo_estado: "ENVIADO" } : item)),
        );
      }
    } catch (err) {
      setResultado({
        tone: "error",
        lines: [err instanceof Error ? err.message : "No se pudo reenviar la activación."],
      });
    } finally {
      setReenviando(false);
    }
  }

  async function ejecutarAprobacion(s: SolicitudAcceso) {
    setBusy(true);
    try {
      const res = await adminService.aprobarSolicitudAcceso(s.id_solicitud);
      setResultado(describirResultado("aprobar", res));
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_QUERY_KEY });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo completar la acción.";
      setResultado({ tone: "error", lines: [msg] });
    } finally {
      setConfirmingAprobar(false);
      setBusy(false);
      await cargar();
    }
  }

  async function ejecutarRechazo(s: SolicitudAcceso, motivo: string) {
    setBusy(true);
    setRejectError(null);
    try {
      const res = await adminService.rechazarSolicitud(s.id_solicitud, motivo);
      setResultado(describirResultado("rechazar", res));
      setRejectingSolicitud(null);
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_QUERY_KEY });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo rechazar la solicitud.";
      setRejectError(msg);
      setResultado({ tone: "error", lines: [msg] });
    } finally {
      setBusy(false);
      await cargar();
    }
  }

  async function verificarDni(s: SolicitudAcceso) {
    setVerificandoDni(true);
    try {
      const res = await adminService.verificarDniSolicitud(s.id_solicitud);
      setDniFeedbackMap((prev) => ({
        ...prev,
        [s.id_solicitud]: {
          estado: res.estado,
          verificado_en: res.verificado_en,
          nombre_reniec: res.nombre_reniec,
        },
      }));
      setItems((current) =>
        current.map((item) =>
          item.id_solicitud === s.id_solicitud
            ? {
                ...item,
                dni_verificacion_estado: res.estado,
                dni_verificado_en: res.verificado_en,
              }
            : item,
        ),
      );
    } catch (err) {
      setDniFeedbackMap((prev) => ({
        ...prev,
        [s.id_solicitud]: {
          estado: "ERROR",
          verificado_en: new Date().toISOString(),
        },
      }));
    } finally {
      setVerificandoDni(false);
    }
  }

  return (
    <div className="max-w-5xl p-4 sm:p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#1C1135]">Solicitudes de acceso</h1>
          <p className="text-sm font-medium text-[#615274]">
            Familias que pidieron acceso por WhatsApp. La cuenta solo se crea cuando tú apruebas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          disabled={loading}
          aria-label="Actualizar solicitudes"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#E8E5F4] bg-white px-3 py-2 text-sm font-bold text-[#6B46FE] shadow-sm hover:bg-[#F8F7FC] disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {resultado && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${TONE_CLASS[resultado.tone]}`}
        >
          {resultado.tone === "ok" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            {resultado.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <button type="button" onClick={() => setResultado(null)} className="text-xs font-bold underline">
            Cerrar
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filtro === f.key}
            onClick={() => cambiarFiltro(f.key)}
            className="rounded-2xl border-2 bg-white p-3 text-left shadow-sm transition-all sm:p-4"
            style={{
              borderColor: filtro === f.key ? "#6B46FE" : "#E8E5F4",
              background: filtro === f.key ? "#EDE9FE" : "#fff",
            }}
          >
            <span className="block text-2xl font-black" style={{ color: f.tone }}>
              {counts[f.key]}
            </span>
            <span className="text-xs font-bold text-[#615274]">{f.label}</span>
          </button>
        ))}
      </div>

      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="mb-3 font-bold text-red-800">{loadError}</p>
          <button
            type="button"
            onClick={() => void cargar()}
            className="rounded-2xl bg-[#6B46FE] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#5833EA]"
          >
            Reintentar
          </button>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#E8E5F4] bg-white p-10 text-sm font-bold text-[#615274] shadow-sm">
          <Loader2 size={18} className="animate-spin" /> Cargando solicitudes…
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="flex flex-col gap-3 lg:col-span-2">
            {visibles.length === 0 && (
              <div className="rounded-2xl border border-[#E8E5F4] bg-white p-8 text-center shadow-sm">
                <p className="font-extrabold text-[#1C1135]">
                  No hay solicitudes {FILTROS.find((f) => f.key === filtro)?.label.toLowerCase()}
                </p>
                <p className="text-sm font-medium text-[#615274]">
                  Cuando una familia escriba por WhatsApp, aparecerá aquí.
                </p>
              </div>
            )}
            {visibles.map((s) => (
              <SolicitudCard
                key={s.id_solicitud}
                solicitud={s}
                selected={selectedId === s.id_solicitud}
                onSelect={() => {
                  setSelectedId(s.id_solicitud);
                  setConfirmingAprobar(false);
                  setRejectingSolicitud(null);
                }}
              />
            ))}
          </div>

          <div className="lg:col-span-3">
            {!seleccionada ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[#E8E5F4] bg-white p-10 text-center shadow-sm">
                <UserCheck size={32} className="mb-3 text-[#6B46FE]" />
                <p className="mb-1 font-extrabold text-[#1C1135]">Selecciona una solicitud</p>
                <p className="text-sm font-medium text-[#615274]">Elige una tarjeta para ver los datos y decidir.</p>
              </div>
            ) : (
              <SolicitudDetalle
                s={seleccionada}
                dniFeedback={dniFeedbackMap[seleccionada.id_solicitud]}
                confirmingAprobar={confirmingAprobar}
                busy={busy}
                verificandoDni={verificandoDni}
                onAskAprobar={() => setConfirmingAprobar(true)}
                onCancelAprobar={() => setConfirmingAprobar(false)}
                onConfirmAprobar={() => void ejecutarAprobacion(seleccionada)}
                onOpenRejectDialog={() => {
                  setConfirmingAprobar(false);
                  setRejectError(null);
                  setRejectingSolicitud(seleccionada);
                }}
                onVerificarDni={() => void verificarDni(seleccionada)}
                onReenviar={() => void reenviar(seleccionada)}
                reenviando={reenviando}
              />
            )}
          </div>
        </div>
      )}

      {rejectingSolicitud && (
        <RechazoSolicitudDialog
          solicitud={rejectingSolicitud}
          busy={busy}
          error={rejectError}
          onClose={() => {
            if (!busy) {
              setRejectingSolicitud(null);
              setRejectError(null);
            }
          }}
          onConfirm={(motivo) => void ejecutarRechazo(rejectingSolicitud, motivo)}
        />
      )}
    </div>
  );
}
