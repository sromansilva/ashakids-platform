import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { pathToView, viewToPath, getRequiredRoleForPath } from "@/routes/paths";
import { B } from "@/theme/brand/B";
import { appointments } from "@/mocks/demo";
import type { View } from "@/types/navigation";
import type { Role } from "@/types/navigation";
import type { SemanticRole } from "@/types/auth";
import type { AppointmentRequest } from "@/types/AppointmentRequest";
import type { PadreNotif } from "@/types/PadreNotif";
// Temporary UI workflow: appointments and notifications are simulated, not persisted.
export function useDemoWorkflow() {
const location = useLocation();
const navigate = useNavigate();
const { user, role: authRole, logout: authLogout } = useAuth();
const view: View = pathToView(location.pathname, authRole);
const role: Role = authRole ? (authRole.toLowerCase() as Role) : null;
const [padreUserName, setPadreUserName] = useState("Laura Gómez");
const [padrePlan, setPadrePlan] = useState<"exploracion" | "familia">("exploracion");
const [parentAppointments, setParentAppointments] = useState<AppointmentRequest[]>(() => appointments.map((appointment) => ({
    ...appointment,
    status: "confirmada",
    paymentStatus: "pendiente",
  })) as AppointmentRequest[]);
const addParentAppointment = (appointment: AppointmentRequest) => setParentAppointments((current) => current.some((item) => item.id === appointment.id) ? current : [...current, appointment]);
const [padreExtraNotifs, setPadreExtraNotifs] = useState<PadreNotif[]>([]);
useEffect(() => {
    if (user) {
      setPadreUserName(`${user.nombres} ${user.apellidos}`);
    }
  }, [user]);
const handleTerapeutaRequestUpdate = (id: number, status: "confirmada" | "rechazada") => {
    setParentAppointments(current => {
      const apt = current.find(a => a.id === id);
      if (apt && status === "confirmada") {
        const label = apt.type === "presencial" ? "Presencial · Jr. Ricardo Treneman 252" : "Virtual · ASHA Session";
        setPadreExtraNotifs(prev => [{
          icon: "✅",
          title: `Cita confirmada con ${apt.therapist}`,
          time: `${apt.date} · ${apt.time} · ${label}`,
          color: B.success,
          bg: B.successLight,
        }, ...prev]);
      }
      return current.map(a => a.id === id ? { ...a, status, ...(status === "confirmada" ? { paymentStatus: "pendiente" as const } : {}) } : a);
    });
  };
const bookedSlots = parentAppointments
    .filter(a => a.status === "por confirmar" || a.status === "confirmada")
    .map(a => ({ therapist: a.therapist, date: a.date, time: a.time }));
const handleLogin = (semanticRole: SemanticRole, plan: "exploracion" | "familia" = "familia") => {
    if (semanticRole === "PADRE") setPadrePlan(plan);
    const from = location.state?.from?.pathname;
    if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && getRequiredRoleForPath(from, semanticRole) === semanticRole) {
      navigate(from, { replace: true });
      return;
    }
    if (semanticRole === "ADMIN") navigate("/admin");
    else if (semanticRole === "TERAPEUTA") navigate("/terapeuta");
    else navigate("/padre");
  };
const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      // Ignorar error de red si expiró la sesión
    }
    navigate("/login");
  };
const go = (target: View | string) => {
    const targetPath = viewToPath(target);
    navigate(targetPath);
  };
return { view, role, authRole, go, navigate, location, handleLogin, handleLogout, padreUserName, padrePlan, parentAppointments, addParentAppointment, setParentAppointments, padreExtraNotifs, setPadreExtraNotifs, handleTerapeutaRequestUpdate, bookedSlots, setPadreUserName };
}
