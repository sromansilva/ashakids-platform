import { useParams } from 'react-router-dom';
import { SessionActions } from '@/shared/presentation/components/common/SessionActions';

export function ActiveClinicalSessionPage() {
  const { appointmentId: rawId } = useParams();
  const appointmentId = Number(rawId);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return <main className="mx-auto max-w-3xl p-6" role="alert">La cita indicada no es válida.</main>;
  }
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 text-[#1C1135] sm:p-8">
      <header className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Ashakids · sesión clínica</p>
        <h1 className="mt-2 text-2xl font-black">Panel de sesión activa</h1>
        <p className="mt-2 text-sm text-[#615274]">Este panel muestra la cita, el control de inicio y el espacio de trabajo del terapeuta.</p>
      </header>
      <SessionActions appointmentId={appointmentId} activeSessionPanel />
    </main>
  );
}
