// Development-only visual fixture. All writes are synthetic; no backend contact.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/auth/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ClinicalReportEditor } from '@/components/common/ClinicalReportEditor';
import '@/Index.css';

const report = { id_sesion: 9, id_reporte_sesion: 1, fecha_creacion: '2026-01-01',
  observaciones_iniciales: 'REPORTE SINTÉTICO: observación de prueba.', objetivos_trabajados: 'Objetivo de prueba.',
  nivel_ayuda: 'Apoyo de prueba.', proximos_pasos: 'Continuar con una actividad de prueba.' };
let rejectWrite = false;
const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
function Fixture() {
  const [view, setView] = useState('login');
  return <AuthContext.Provider value={{ user: null, role: null, isAuthenticated: false, isLoading: false,
    login: async () => { throw new Error('Acceso sintético rechazado. No se contactó al servidor.'); },
    logout: async () => {}, refreshUser: async () => {} }}><QueryClientProvider client={client}>
    <nav aria-label="Prueba aislada" className="flex flex-wrap items-center gap-3 bg-amber-50 p-3 text-sm">
      <strong>U0 · datos sintéticos · sin backend</strong>
      <label>Vista <select value={view} onChange={e => setView(e.target.value)} className="min-h-11 border rounded px-2">
        <option value="login">Acceso</option><option value="report">Reporte existente</option>
      </select></label>
      <label className="flex min-h-11 items-center gap-2"><input type="checkbox" onChange={e => { rejectWrite = e.target.checked; }} />Simular error 422</label>
    </nav>
    {view === 'login' ? <LoginPage onSuccess={() => {}} onGoHome={() => setView('report')} /> :
      <main className="mx-auto max-w-2xl p-6"><h1 className="mb-5 text-2xl font-bold">Reporte de prueba</h1><ClinicalReportEditor id={9} initial={report} /></main>}
  </QueryClientProvider></AuthContext.Provider>;
}
if (import.meta.env.DEV) {
  // Reject every unrecognised request; this fixture cannot fall back to real fetch.
  window.fetch = async (input, init) => {
    if (!String(input).endsWith('/sesiones/9/reporte') || init?.method !== 'PUT') throw new Error('Petición bloqueada por el fixture U0');
    const body = JSON.parse(String(init.body));
    const extra = Object.keys(body).some(key => !['observaciones_iniciales', 'objetivos_trabajados', 'nivel_ayuda', 'proximos_pasos'].includes(key));
    return new Response(JSON.stringify(rejectWrite || extra ? { detail: 'Error 422 sintético: conserva y revisa tu borrador.' } : { ...report, ...body }),
      { status: rejectWrite || extra ? 422 : 200, headers: { 'Content-Type': 'application/json' } });
  };
  const root = createRoot(document.getElementById('root')!); root.render(<Fixture />);
  import.meta.hot?.dispose(() => root.unmount());
  import.meta.hot?.accept(() => window.location.reload());
}
