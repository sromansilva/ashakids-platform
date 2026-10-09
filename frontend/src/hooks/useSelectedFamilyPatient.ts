import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useRemote } from "./useRemoteData";
import { patientsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";

function storedPatient(key: string) {
  try { return Number(sessionStorage.getItem(key)) || null; } catch { return null; }
}
export function useSelectedFamilyPatient() {
  const { user } = useAuth();
  const key = `ashakids:selected-patient:${user?.id_usuario ?? "anonymous"}`;
  const [selected, setSelected] = useState<number | null>(() => storedPatient(key));
  useEffect(() => { setSelected(storedPatient(key)); }, [key]);
  const patients = useRemote(["family-patients"], signal => readAllPages(offset => patientsService.list({ activo: true, limit: 100, offset }, signal), signal));
  const children = patients.data ?? [];
  const patient = children.find(p => p.id_paciente === selected) ?? children[0];
  const selectPatient = (id: number) => {
    if (!children.some(p => p.id_paciente === id)) return;
    setSelected(id);
    try { sessionStorage.setItem(key, String(id)); } catch { /* Selection works without storage. */ }
  };
  return { patients, children, patient, selectPatient };
}
