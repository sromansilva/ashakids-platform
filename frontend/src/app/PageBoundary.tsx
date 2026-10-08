import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { RouteLoading } from "@/app/RouteLoading";

class RenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("No se pudo mostrar la pantalla", error, info.componentStack);
  }
  render() {
    if (this.state.failed) return <main role="alert" className="p-8 text-center">
      <h1 className="text-xl font-bold">No pudimos cargar esta pantalla</h1>
      <p className="my-4">Intenta recargar. Si el problema continúa, vuelve al inicio.</p>
      <button className="rounded-xl bg-violet-700 text-white px-4 py-2" onClick={() => window.location.reload()}>Reintentar</button>
      <a className="ml-4 text-violet-700" href="/">Volver al inicio</a>
    </main>;
    return this.props.children;
  }
}

export function PageBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <RenderBoundary key={pathname}><Suspense fallback={<RouteLoading />}>{children}</Suspense></RenderBoundary>;
}
