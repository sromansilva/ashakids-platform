import { useEffect, useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { adminService, AuditoriaItem } from "@/services/adminService";
import { ApiError } from "@/api/client";

const accionLabel: Record<string, string> = {
  INSERT: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
};

export function AdminAuditoria() {
  const [items, setItems] = useState<AuditoriaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminService.getAuditoria()
      .then(result => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof ApiError && cause.status === 403
          ? "No tienes permiso para consultar estos registros."
          : "No se pudo cargar el registro. Intenta nuevamente más tarde.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 mb-5">
        <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-blue-800">
          <span className="font-extrabold">Registro de acciones administrativas.</span> Se muestran actor, acción y fecha. Los datos personales y detalles clínicos del evento no se exponen aquí.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135]">Auditoría y seguridad</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Eventos registrados por el sistema · {total} en total</p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#7C6F9A]" role="status">Cargando registros…</p>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <AlertTriangle size={17} />{error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E5F4] bg-white/70 px-6 py-12 text-center">
          <Shield size={24} className="mx-auto mb-3 text-[#7C6F9A]" />
          <p className="font-bold text-[#1C1135]">Todavía no hay acciones registradas</p>
          <p className="mt-1 text-sm text-[#7C6F9A]">Las operaciones administrativas aparecerán aquí cuando se guarden.</p>
        </div>
      ) : (
        <div className="admin-audit-events flex flex-col gap-2" aria-live="polite">
          {items.map(item => (
            <article key={item.id_auditoria} className="rounded-2xl border border-[#E8E5F4] p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-extrabold text-sm text-[#1C1135]">
                    {accionLabel[item.accion] ?? item.accion} de registro
                  </p>
                  <p className="mt-1 text-xs text-[#4B4869]">Actor: <span className="font-bold">{item.actor ?? "Cuenta eliminada"}</span></p>
                  <p className="text-xs text-[#7C6F9A]">{item.nombre_tabla} · Registro {item.nombre_entidad}</p>
                </div>
                <time className="text-xs font-medium text-[#7C6F9A]" dateTime={item.fecha_evento}>
                  {new Date(item.fecha_evento).toLocaleString("es-PE", { timeZone: "America/Lima" })}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && items.length > 0 && total > items.length && (
        <p className="mt-4 text-center text-xs text-[#7C6F9A]">Se muestran las 100 acciones más recientes.</p>
      )}
    </div>
  );
}
