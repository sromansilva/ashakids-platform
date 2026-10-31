import { patientsService } from "@/modules/clinica/infrastructure/clinicalService";
import { readAllPages } from "@/core/api/readAllPages";
import { useRemote } from "../../../shared/application/hooks/useRemoteData";
import { normalizePatientSex } from '@/shared/domain/types/patientSex';
import { useAuth } from "@/modules/auth/application/useAuth";

export function useFamilyPatients() {
  const { user } = useAuth();
  const query = useRemote(["family-patients", user?.id_usuario ?? "anonymous"], signal => readAllPages(offset => patientsService.list({ activo: true, limit: 100, offset }, signal), signal));
  const children = (query.data ?? []).map(p => ({ id: p.id_paciente, name: p.nombres_paciente,
    surname: p.apellidos_paciente, birthdate: p.fecha_nacimiento, sex: String(normalizePatientSex(p.sexo)),
    avatar_nombre: p.avatar_nombre || "zorro",
    age: Math.max(0, Math.floor((Date.now() - Date.parse(p.fecha_nacimiento)) / 31557600000)),
    therapist: "Consultar tratamiento", sessions: 0, progress: 0, emoji: "🐻", bg: "#EDE9FE" }));
  return { query, children };
}
