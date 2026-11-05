import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/application/useAuth';

export function SoporteLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F8F7FC] text-[#1C1135]">
    <header className="shrink-0 border-b border-[#E8E5F4] bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link to="/soporte" className="text-lg font-black text-[#6B46FE]">AshaKids · Soporte Técnico</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm"><span>{user?.nombres} {user?.apellidos}</span>
          <button className="rounded-xl border border-[#E8E5F4] px-4 py-2 font-bold" onClick={async () => { await logout(); navigate('/login'); }}>Cerrar sesión</button>
        </div>
      </div>
      <nav aria-label="Soporte Técnico" className="mx-auto mt-4 max-w-7xl"><Link to="/soporte/incidencias" className="font-bold text-[#6B46FE]">Incidencias técnicas</Link></nav>
    </header>
    <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
  </div>;
}
