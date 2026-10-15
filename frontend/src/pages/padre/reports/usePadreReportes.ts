import { useState } from 'react';
import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';

export function usePadreReportes() {
  const [tab, setTab] = useState<'sesiones' | 'progreso'>('sesiones');
  const [openSession, setOpenSession] = useState<number | null>(null);
  const sessionsQuery = useRemote(['sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const sessions = (sessionsQuery.isError ? [] : sessionsQuery.data ?? []).map(s => ({
    id: s.id_sesion, appointmentId: s.id_reserva, patient: s.cita.paciente_nombre,
    date: new Date(s.cita.fecha_hora_inicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
    time: new Date(s.cita.fecha_hora_inicio).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' }),
    duration: s.fecha_hora_inicio_real && s.fecha_hora_fin_real ? `${Math.round((Date.parse(s.fecha_hora_fin_real) - Date.parse(s.fecha_hora_inicio_real))/60000)} min` : 'Sin duración registrada',
    therapist: s.cita.terapeuta_nombre, type: s.cita.modalidad === 'VIRTUAL' ? 'virtual' : 'presencial',
    state: s.estado_sesion, reportAvailable: s.reporte_disponible,
  }));
  return { sessionsQuery, tab, setTab, openSession, setOpenSession, sessions };
}
