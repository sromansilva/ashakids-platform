import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Info, Loader2, RefreshCw, UserCheck, XCircle } from "lucide-react";
import { Av } from "@/shared/presentation/components/common/Av";
import { adminService, type ResultadoSolicitudAcceso, type SolicitudAcceso } from "@/modules/admin/infrastructure/adminService";

type Filtro = "PENDIENTE" | "APROBADA" | "RECHAZADA";
type Accion = "aprobar" | "rechazar";
type Resultado = { tone: "ok" | "warn" | "error"; lines: string[] };

const FILTROS: Array<{ key: Filtro; label: string; tone: string }> = [
  { key: "PENDIENTE", label: "Pendientes", tone: "#D97706" },
  { key: "APROBADA", label: "Aprobadas", tone: "#16A34A" },
  { key: "RECHAZADA", label: "Rechazadas", tone: "#DC2626" },
];

const AVISO_TEXTO: Record<string, string> = {
  ENVIADO: "Aviso por WhatsApp enviado.",
  FUERA_DE_VENTANA: "No se avisó por WhatsApp: pasaron más de 24 horas desde su último mensaje.",
  ERROR: "El aviso por WhatsApp falló. La decisión sigue vigente.",
  NO_CONFIGURADO: "WhatsApp no está configurado, por eso no se envió aviso.",
  OMITIDO: "No se avisó por WhatsApp porque el correo de activación no salió.",
};

function fecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" });
}

function iniciales(s: SolicitudAcceso): string {
  return `${s.nombres.charAt(0)}${s.apellidos.charAt(0)}`.toUpperCase() || "?";
}

function describirResultado(accion: Accion, r: ResultadoSolicitudAcceso): Resultado {
  const lines: string[] = [];
  const aviso = r.aviso_whatsapp ? AVISO_TEXTO[r.aviso_whatsapp] ?? `Aviso por WhatsApp: ${r.aviso_whatsapp}.` : null;
  if (accion === "rechazar") {
    lines.push("Solicitud rechazada.");
    if (aviso) lines.push(aviso);
    return { tone: r.aviso_whatsapp === "ERROR" ? "warn" : "ok", lines };
  }
  const correoSalio = r.correo_bienvenida === "ENVIADO";
  if (correoSalio) {
    lines.push(`Cuenta creada. El enlace de activación se envió a ${r.solicitud.email}.`);
  } else {
    lines.push("Cuenta creada, pero el correo de activación NO salió.");
    lines.push("Usa el reenvío de activación para enviar el enlace a la familia.");
  }
  if (aviso) lines.push(aviso);
  return { tone: correoSalio && r.aviso_whatsapp !== "ERROR" ? "ok" : "warn", lines };
}

const TONE_CLASS: Record<Resultado["tone"], string> = {
  ok: "border-green-200 bg-green-50 text-green-800",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-800",
};

export function AdminSolicitudes() {
  const [filtro, setFiltro] = useState<Filtro>("PENDIENTE");
  const [items, setItems] = useState<SolicitudAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<Accion | null>(null);
  const [busy, setBusy] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminService.getSolicitudesAcceso();
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const counts = useMemo(() => ({
    PENDIENTE: items.filter((i) => i.estado === "PENDIENTE" || i.estado === "PROCESANDO").length,
    APROBADA: items.filter((i) => i.estado === "APROBADA").length,
    RECHAZADA: items.filter((i) => i.estado === "RECHAZADA").length,
  }), [items]);

  const visibles = useMemo(
    () => items.filter((i) => (filtro === "PENDIENTE" ? i.estado === "PENDIENTE" || i.estado === "PROCESANDO" : i.estado === filtro)),
    [items, filtro],
  );
  const seleccionada = visibles.find((i) => i.id_solicitud === selectedId) ?? null;

  const cambiarFiltro = (f: Filtro) => { setFiltro(f); setSelectedId(null); setConfirming(null); };

  async function reenviar(s: SolicitudAcceso) {
    if (!s.id_usuario_creado) return;
    setReenviando(true);
    setResultado(null);
    try {
      const res = await adminService.reenviarActivacion(s.id_usuario_creado);
      setResultado({ tone: res.correo_estado === 'ENVIADO' ? 'ok' : 'warn', lines: [res.correo_estado === 'ENVIADO' ? 'Correo de activación enviado.' : `Correo de activación: ${res.correo_estado}.`] });
      if (res.correo_estado === 'ENVIADO') setItems((current) => current.map((item) => item.id_solicitud === s.id_solicitud ? { ...item, correo_estado: 'ENVIADO' } : item));
    } catch (err) { setResultado({ tone: 'error', lines: [err instanceof Error ? err.message : 'No se pudo reenviar la activación.'] }); }
    finally { setReenviando(false); }
  }

  async function ejecutar(accion: Accion, s: SolicitudAcceso) {
    setBusy(true);
    try {
      const res = accion === "aprobar"
        ? await adminService.aprobarSolicitudAcceso(s.id_solicitud)
        : await adminService.rechazarSolicitudAcceso(s.id_solicitud);
      setResultado(describirResultado(accion, res));
      setSelectedId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo completar la acción.";
      setResultado({ tone: "error", lines: [msg] });
    } finally {
      setConfirming(null);
      setBusy(false);
      await cargar();
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
        <div role="status" className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${TONE_CLASS[resultado.tone]}`}>
          {resultado.tone === "ok" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
          <div className="min-w-0 flex-1">
            {resultado.lines.map((line) => <p key={line}>{line}</p>)}
          </div>
          <button type="button" onClick={() => setResultado(null)} className="text-xs font-bold underline">Cerrar</button>
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
            style={{ borderColor: filtro === f.key ? "#6B46FE" : "#E8E5F4", background: filtro === f.key ? "#EDE9FE" : "#fff" }}
          >
            <span className="block text-2xl font-black" style={{ color: f.tone }}>{counts[f.key]}</span>
            <span className="text-xs font-bold text-[#615274]">{f.label}</span>
          </button>
        ))}
      </div>

      {loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="mb-3 font-bold text-red-800">{loadError}</p>
          <button type="button" onClick={() => void cargar()} className="rounded-2xl bg-[#6B46FE] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#5833EA]">
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
                <p className="font-extrabold text-[#1C1135]">No hay solicitudes {FILTROS.find((f) => f.key === filtro)?.label.toLowerCase()}</p>
                <p className="text-sm font-medium text-[#615274]">Cuando una familia escriba por WhatsApp, aparecerá aquí.</p>
              </div>
            )}
            {visibles.map((s) => (
              <button
                key={s.id_solicitud}
                type="button"
                onClick={() => { setSelectedId(s.id_solicitud); setConfirming(null); }}
                aria-pressed={selectedId === s.id_solicitud}
                className="flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all hover:border-[#6B46FE]"
                style={{ borderColor: selectedId === s.id_solicitud ? "#6B46FE" : "#E8E5F4" }}
              >
                <Av initials={iniciales(s)} color="#6B46FE" size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#1C1135]">{s.nombres} {s.apellidos}</p>
                  <p className="truncate text-xs font-medium text-[#615274]">{s.email}</p>
                  <p className="text-xs font-medium text-[#9E95B7]">
                    {fecha(s.creado_en)}{s.estado === "PROCESANDO" ? " · Procesando" : ""}
                  </p>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[#9E95B7]" />
              </button>
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
              <DetalleSolicitud
                s={seleccionada}
                confirming={confirming}
                busy={busy}
                onAsk={setConfirming}
                onConfirm={(accion) => void ejecutar(accion, seleccionada)}
                onReenviar={() => void reenviar(seleccionada)}
                reenviando={reenviando}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetalleSolicitud({ s, confirming, busy, onAsk, onConfirm, onReenviar, reenviando }: {
  s: SolicitudAcceso;
  confirming: Accion | null;
  busy: boolean;
  onAsk: (a: Accion | null) => void;
  onConfirm: (a: Accion) => void;
  onReenviar: () => void;
  reenviando: boolean;
}) {
  const campos = [
    { l: "Nombres", v: s.nombres },
    { l: "Apellidos", v: s.apellidos },
    { l: "DNI", v: s.dni },
    { l: "Correo", v: s.email },
    { l: "Teléfono (WhatsApp)", v: s.telefono },
    { l: "Fecha de solicitud", v: fecha(s.creado_en) },
  ];
  return (
    <div className="rounded-3xl border border-[#E8E5F4] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <Av initials={iniciales(s)} color="#6B46FE" size="xl" />
        <div className="min-w-0">
          <h2 className="break-words text-xl font-extrabold text-[#1C1135]">{s.nombres} {s.apellidos}</h2>
          <p className="text-sm font-medium text-[#615274]">Solicitud #{s.id_solicitud} · {s.estado === "PROCESANDO" ? "Procesando" : s.estado.charAt(0) + s.estado.slice(1).toLowerCase()}</p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {campos.map((c) => (
          <div key={c.l} className="min-w-0 rounded-2xl bg-[#F8F7FC] p-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#9E95B7]">{c.l}</p>
            <p className="break-words text-sm font-bold text-[#1C1135]">{c.v}</p>
          </div>
        ))}
      </div>

      {s.estado === "PENDIENTE" && confirming === null && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => onAsk("aprobar")} className="flex-1 rounded-2xl bg-[#6B46FE] py-2.5 text-sm font-extrabold text-white hover:bg-[#5833EA]">
            Aprobar
          </button>
          <button type="button" onClick={() => onAsk("rechazar")} className="flex-1 rounded-2xl border-2 border-red-600 py-2.5 text-sm font-extrabold text-red-600 hover:bg-red-50">
            Rechazar
          </button>
        </div>
      )}

      {s.estado === "PENDIENTE" && confirming !== null && (
        <div role="alertdialog" aria-label={confirming === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"} className="rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-extrabold text-[#1C1135]">
            <Info size={16} className="text-[#6B46FE]" />
            {confirming === "aprobar" ? `¿Aprobar la solicitud de ${s.nombres}?` : `¿Rechazar la solicitud de ${s.nombres}?`}
          </p>
          <p className="mb-3 text-sm font-medium text-[#615274]">
            {confirming === "aprobar"
              ? "Se creará la cuenta familiar y se enviará el enlace de activación al correo registrado."
              : "No se creará ninguna cuenta. Si está dentro de las 24 horas de WhatsApp, se le enviará un aviso neutro."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirm(confirming)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-extrabold text-white disabled:opacity-60 ${confirming === "aprobar" ? "bg-[#6B46FE] hover:bg-[#5833EA]" : "bg-red-600 hover:bg-red-700"}`}
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {confirming === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"}
            </button>
            <button type="button" disabled={busy} onClick={() => onAsk(null)} className="flex-1 rounded-2xl border border-[#E8E5F4] bg-white py-2.5 text-sm font-extrabold text-[#615274] hover:bg-[#F8F7FC] disabled:opacity-60">
              Volver
            </button>
          </div>
        </div>
      )}

      {s.estado === "PROCESANDO" && (
        <p className="rounded-2xl bg-[#F8F7FC] p-3 text-sm font-bold text-[#615274]">Otra revisión está procesando esta solicitud. Actualiza en unos segundos.</p>
      )}

      {s.estado === "APROBADA" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
          <p className="flex items-center gap-2 font-extrabold"><CheckCircle2 size={16} /> Aprobada el {fecha(s.revisado_en)}</p>
          {s.correo_estado === "ENVIADO"
            ? <p>El enlace de activación se envió al correo.</p>
            : <p className="text-amber-900">El correo de activación no salió ({s.correo_estado ?? "sin dato"}). Usa el reenvío de activación.</p>}
          {s.correo_estado !== "ENVIADO" && s.id_usuario_creado && <button type="button" disabled={reenviando} onClick={onReenviar} className="mt-2 rounded-xl bg-[#6B46FE] px-4 py-2 text-white disabled:opacity-60">{reenviando ? "Enviando..." : "Reenviar activación"}</button>}
          {s.aviso_whatsapp_estado && <p>{AVISO_TEXTO[s.aviso_whatsapp_estado] ?? `Aviso por WhatsApp: ${s.aviso_whatsapp_estado}.`}</p>}
        </div>
      )}

      {s.estado === "RECHAZADA" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          <p className="flex items-center gap-2 font-extrabold"><XCircle size={16} /> Rechazada el {fecha(s.revisado_en)}</p>
          {s.aviso_whatsapp_estado && <p>{AVISO_TEXTO[s.aviso_whatsapp_estado] ?? `Aviso por WhatsApp: ${s.aviso_whatsapp_estado}.`}</p>}
        </div>
      )}
    </div>
  );
}
