import { Link } from "react-router-dom";
export function NotFoundPage() {
  return <main className="p-8 text-center">
    <h1 className="text-2xl font-black">Página no encontrada</h1>
    <p className="my-4">La dirección no corresponde a una pantalla de ASHAKids.</p>
    <Link to="/" className="text-violet-700 font-bold">Volver al inicio</Link>
  </main>;
}
