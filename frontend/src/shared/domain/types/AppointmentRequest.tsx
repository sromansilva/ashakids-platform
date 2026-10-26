
export type AppointmentRequest = {
  id: number;
  therapist: string;
  specialty: string;
  child: string;
  parent?: string;
  date: string;
  time: string;
  type: "virtual" | "presencial";
  status: "por confirmar" | "confirmada" | "cancelada" | "rechazada" | "completada";
  durationMinutes?: number;
  paymentStatus?: "pendiente" | "pagada";
};
