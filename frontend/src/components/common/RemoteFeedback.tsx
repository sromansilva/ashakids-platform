import { ApiError } from "@/api/client";
import { Btn } from "./Btn";
export function RemoteFeedback({ pending, error, retry }: { pending?: boolean; error?: unknown; retry?: () => void }) {
  if (pending) return <p role="status" className="py-3 text-sm font-medium text-[#7C6F9A]">Cargando datos…</p>;
  if (!error) return null;
  const message = error instanceof ApiError && error.status === 0 ? "No hay conexión con el servidor. Tus cambios no se han guardado." : error instanceof Error ? error.message : "No se pudo completar la operación.";
  return <div role="alert" className="my-3 p-3 rounded-2xl bg-red-50 text-red-700 text-sm"><p>{message}</p>{retry && <Btn variant="outline" size="sm" onClick={retry}>Reintentar</Btn>}</div>;
}
