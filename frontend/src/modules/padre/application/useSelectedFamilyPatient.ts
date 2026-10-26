import { useEffect, useState } from "react";
import { useAuth } from "../../auth/application/useAuth";
import { useRemote } from "../../../shared/application/hooks/useRemoteData";
import { patientsService } from "@/modules/clinica/infrastructure/clinicalService";
import { readAllPages } from "@/core/api/readAllPages";

function storedPatient(key: string) {
  try { return Number(sessionStorage.getItem(key)) || null; } catch { return null; }
}
export function useSelectedFamilyPatient() {
  const { user } = useAuth();
  const key = `ashakids:selected-patient:${user?.id_usuario ?? "anonymous"}`;
  const [selected, setSelected] = useState<number | null>(() => storedPatient(key));
  useEffect(() => {
    setSelected(storedPatient(key));
    const onChange = () => setSelected(storedPatient(key));
    window.addEventListener('storage', onChange);
    window.addEventListener('ashakids:patient-changed', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('ashakids:patient-changed', onChange);
    };
  }, [key]);
  const patients = useRemote(["family-patients"], signal => readAllPages(offset => patientsService.list({ activo: true, limit: 100, offset }, signal), signal));
  const children = patients.data ?? [];
  const patient = children.find(p => p.id_paciente === selected) ?? children[0];
  const selectPatient = (id: number) => {
    if (!children.some(p => p.id_paciente === id)) return;
    setSelected(id);
    try {
      sessionStorage.setItem(key, String(id));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('ashakids:patient-changed', { detail: id }));
    } catch { /* Selection works without storage. */ }
  };
  return { patients, children, patient, selectPatient };
}
