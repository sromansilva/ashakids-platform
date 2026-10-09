import { useState } from "react";
import { View } from "@/types/navigation";
import { ExpTab } from "@/pages/terapeuta/TerapeutaPacientes/ExpTab";
import { B } from "@/theme/brand/B";
import { useRemote } from "@/hooks/useRemoteData";
import { readAllPages } from "@/services/readAllPages";
import { patientsService, sessionsService, appointmentsService } from "@/services/clinicalService";

export function useTerapeutaPacientes({ go }: { go: (v: View) => void }) {
  const query = useRemote(["therapist-patients"], (signal) =>
    readAllPages((offset) => patientsService.list({ activo: true, limit: 100, offset }, signal), signal)
  );
  const sessions = useRemote(['therapist-patient-sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const appointments = useRemote(['therapist-patient-appointments'], signal => readAllPages(offset => appointmentsService.list({ limit: 100, offset }, signal), signal));
  const palette = [B.violet, B.teal, "#22C55E", B.orange, "#8B5CF6", "#EC4899"];
  const remotePatients = (query.error ? [] : query.data ?? []).map((p, idx) => ({
    id: p.id_paciente,
    name: `${p.nombres_paciente} ${p.apellidos_paciente}`,
    age: Math.max(0, Math.floor((Date.now() - Date.parse(p.fecha_nacimiento)) / 31557600000)),
    parent: (p as { tutor_nombre?: string }).tutor_nombre ?? "Tutor registrado",
    sessions: sessions.error || !sessions.data ? 'No disponible' : sessions.data.filter(s => s.cita.id_paciente === p.id_paciente).length,
    progress: 0,
    dx: "Paciente asignado",
    nextSession: appointments.error || !appointments.data ? 'No disponible' : (() => {
      const next = appointments.data.filter(a => a.id_paciente === p.id_paciente && ['PENDIENTE', 'CONFIRMADA'].includes(a.estado_reserva) && Date.parse(a.fecha_hora_inicio) >= Date.now()).sort((a, b) => Date.parse(a.fecha_hora_inicio) - Date.parse(b.fecha_hora_inicio))[0];
      return next ? new Date(next.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' }) : 'Por programar';
    })(),
    status: p.activo ? "activo" : "nuevo",
    av: ((p.nombres_paciente[0] || "") + (p.apellidos_paciente[0] || "")).toUpperCase() || "PA",
    color: palette[idx % palette.length],
    nota: "Expediente activo en el sistema clínico.",
  }));
  const patientsList = remotePatients;
const [selected, setSelected] = useState<number | null>(null);
const [expTab, setExpTab] = useState<ExpTab>("resumen");
const [search, setSearch] = useState("");
const [expandedSession, setExpandedSession] = useState<number | null>(null);
const [showAddObj, setShowAddObj] = useState(false);
const [objectives, setObjectives] = useState([
    { id: 1, desc: "Pronunciar correctamente el fonema /r/ vibrante en palabras", area: "Fonología", priority: "Alta", status: "En progreso", baseline: "30%", criterion: "80% en 3 sesiones consecutivas", current: 75, support: "Apoyo mínimo" },
    { id: 2, desc: "Comprensión de instrucciones de dos pasos", area: "Comprensión", priority: "Media", status: "En progreso", baseline: "50%", criterion: "90% de manera independiente", current: 80, support: "Independiente" },
  ]);
const [newObj, setNewObj] = useState({ desc: "", area: "Fonología", priority: "Media" });
const [actSubTab, setActSubTab] = useState<"asignadas" | "resultados">("asignadas");
const [resSubTab, setResSubTab] = useState<"sesion" | "casa">("casa");
const [resFilterDesde, setResFilterDesde] = useState("");
const [resFilterHasta, setResFilterHasta] = useState("");
const [resFilterMundo, setResFilterMundo] = useState("todos");
const [resFilterTipo, setResFilterTipo] = useState("todos");
const [resFilterBuscar, setResFilterBuscar] = useState("");
const [resRapido, setResRapido] = useState<"hoy"|"7d"|"30d"|"custom"|null>("30d");
const [expandedRes, setExpandedRes] = useState<number[]>([]);
const [expandedSesAct, setExpandedSesAct] = useState<number[]>([]);
const [showGenReport, setShowGenReport] = useState(false);
const [reportPeriod, setReportPeriod] = useState("");
const [reportType, setReportType] = useState("Progreso");
const [reportNotes, setReportNotes] = useState("");
const [noteType, setNoteType] = useState("Nota de sesión");
const [noteText, setNoteText] = useState("");
const [noteTitle, setNoteTitle] = useState("");
const [savedNotes, setSavedNotes] = useState<{title:string;text:string;type:string;visibility:string;date:string}[]>([]);
return { go, selected, setSelected, expTab, setExpTab, search, setSearch, expandedSession, setExpandedSession, showAddObj, setShowAddObj, objectives, setObjectives, newObj, setNewObj, actSubTab, setActSubTab, resSubTab, setResSubTab, resFilterDesde, setResFilterDesde, resFilterHasta, setResFilterHasta, resFilterMundo, setResFilterMundo, resFilterTipo, setResFilterTipo, resFilterBuscar, setResFilterBuscar, resRapido, setResRapido, expandedRes, setExpandedRes, expandedSesAct, setExpandedSesAct, showGenReport, setShowGenReport, reportPeriod, setReportPeriod, reportType, setReportType, reportNotes, setReportNotes, noteType, setNoteType, noteText, setNoteText, noteTitle, setNoteTitle, savedNotes, setSavedNotes, patientsList, query };
}
