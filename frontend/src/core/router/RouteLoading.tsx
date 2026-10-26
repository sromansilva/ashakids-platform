export function RouteLoading({ label = "Cargando pantalla…" }: { label?: string }) {
  return <div role="status" aria-live="polite" className="min-h-[50vh] flex items-center justify-center gap-3">
    <span aria-hidden="true" className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    <p>{label}</p>
  </div>;
}
