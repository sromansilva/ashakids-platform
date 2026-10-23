import { useState } from 'react';
import type { View } from '@/types/navigation';
import { B } from '@/theme/brand/B';
import { useRemote } from '@/hooks/useRemoteData';
import { readAllPages } from '@/services/readAllPages';
import { patientsService, sessionsService, appointmentsService } from '@/services/clinicalService';

export function useTerapeutaPacientes({ go }: { go: (view: View) => void }) {
  const query = useRemote(['therapist-patients'], signal => readAllPages(offset => patientsService.list({ activo: true, limit: 100, offset }, signal), signal));
  const sessions = useRemote(['therapist-patient-sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const appointments = useRemote(['therapist-patient-appointments'], signal => readAllPages(offset => appointmentsService.list({ limit: 100, offset }, signal), signal));
  const [selected, setSelected] = useState<number | null>(null);
  const [expTab, setExpTab] = useState<'resumen' | 'sesiones' | 'reportes'>('resumen');
  const [search, setSearch] = useState('');
  const palette = [B.violet, B.teal, B.orange];
  const patientsList = (query.error ? [] : query.data ?? []).map((p, index) => {
    const next = appointments.error ? undefined : appointments.data?.filter(a => a.id_paciente === p.id_paciente && ['PENDIENTE', 'CONFIRMADA'].includes(a.estado_reserva) && Date.parse(a.fecha_hora_inicio) >= Date.now()).sort((a,b) => Date.parse(a.fecha_hora_inicio) - Date.parse(b.fecha_hora_inicio))[0];
    return { id: p.id_paciente, name: `${p.nombres_paciente} ${p.apellidos_paciente}`, age: Math.max(0, Math.floor((Date.now() - Date.parse(p.fecha_nacimiento)) / 31557600000)),
      sessions: sessions.error ? 'No disponible' : !sessions.data ? 'Cargando…' : sessions.data.filter(s => s.cita.id_paciente === p.id_paciente && s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO').length,
      nextSession: appointments.error ? 'No disponible' : !appointments.data ? 'Cargando…' : next ? new Date(next.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : 'Por programar',
      status: p.activo ? 'Activo' : 'Inactivo', av: `${p.nombres_paciente[0] ?? ''}${p.apellidos_paciente[0] ?? ''}`.toUpperCase(), color: palette[index % palette.length] };
  });
  return { go, query, sessions, appointments, selected, setSelected, expTab, setExpTab, search, setSearch, patientsList };
}
