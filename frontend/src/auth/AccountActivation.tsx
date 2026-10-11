import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AccountActivation() {
  const { user, logout } = useAuth();
  return <main className="min-h-screen bg-violet-50 px-4 py-10 flex items-center justify-center text-violet-950">
    <section className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-10">
      <h1 className="text-2xl font-bold">Crea tu contraseña personal</h1>
      <p className="mt-3">Hola, {user?.nombres}. Revisa tu correo y pulsa Crear mi contraseña.</p>
      <p className="mt-2">Tu código de acceso es <strong>{user?.codigo_usuario}</strong>.</p>
      <Link to="/crear-contrasena" className="block mt-6 underline font-bold">Solicitar otro enlace</Link>
      <button onClick={() => void logout()} className="mt-5 min-h-11 underline">Cerrar sesión</button>
    </section>
  </main>;
}
