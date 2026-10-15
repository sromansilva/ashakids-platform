import { useState } from 'react';
import { ChevronRight, Video } from 'lucide-react';
import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import { Crd } from '@/components/common/Crd';
import { SessionActions } from '@/components/common/SessionActions';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { B } from '@/theme/brand/B';

export function PatientClinicalHistory({ patientId, reportsOnly = false }: { patientId: number; reportsOnly?: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const query = useRemote(['patient-clinical-history', patientId], signal =>
    readAllPages(offset => sessionsService.list({ paciente: patientId, contexto: true, limit: 100, offset }, signal), signal));
  const rows = query.error ? [] : (query.data ?? []).filter(s => !reportsOnly || s.reporte_disponible);
  return <div className="flex flex-col gap-3">
    <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    {query.isSuccess && !query.error && !rows.length && <Crd className="p-5 text-sm text-[#7C6F9A]">{reportsOnly ? 'Sin reportes guardados. Registra el reporte desde la sesión clínica.' : 'Sin sesiones registradas para este paciente.'}</Crd>}
    {rows.map(session => <Crd key={session.id_sesion} className="overflow-hidden">
      <button className="w-full text-left p-5" onClick={() => setExpanded(expanded === session.id_sesion ? null : session.id_sesion)}>
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.tealLight }}><Video size={16} style={{ color: B.teal }} /></div>
          <div><p className="font-extrabold text-[#1C1135] text-sm">Sesión #{session.id_sesion} · {new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</p>
            <p className="text-xs text-[#7C6F9A]">{session.estado_sesion} · {session.cita.terapeuta_nombre} · {session.reporte_disponible ? 'Reporte guardado' : 'Sin reporte'}</p></div>
        </div><ChevronRight size={14} style={{ transform: expanded === session.id_sesion ? 'rotate(90deg)' : undefined }} /></div>
      </button>
      {expanded === session.id_sesion && <div className="px-5 pb-5"><SessionActions appointmentId={session.id_reserva} /></div>}
    </Crd>)}
  </div>;
}
