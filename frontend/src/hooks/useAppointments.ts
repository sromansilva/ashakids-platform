import { appointmentsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import { useRemote } from "./useRemoteData";
import type { AppointmentRequest } from "@/types/AppointmentRequest";
const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export function useAppointments(enabled = true) {
  const query = useRemote(["appointments"], signal => readAllPages(offset => appointmentsService.list({ limit: 100, offset }, signal), signal), enabled);
  const appointments: AppointmentRequest[] = (query.data ?? []).map(c => {
    const d = new Date(Date.parse(c.fecha_hora_inicio) - 5 * 3600000);
    return { id: c.id_reserva, therapist: c.terapeuta_nombre, child: c.paciente_nombre, specialty: '',
      date: `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`, time: d.toISOString().slice(11,16),
      type: c.modalidad === 'VIRTUAL' ? 'virtual' : 'presencial',
      status: c.estado_reserva === 'PENDIENTE' ? 'por confirmar' : c.estado_reserva === 'CANCELADA' ? 'cancelada' : c.estado_reserva === 'COMPLETADA' ? 'completada' : 'confirmada' };
  });
  return { query, appointments };
}
