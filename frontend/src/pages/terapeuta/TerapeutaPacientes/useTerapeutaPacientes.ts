import { useState } from "react";
import { View } from "@/types/navigation";
import { ExpTab } from "@/pages/terapeuta/TerapeutaPacientes/ExpTab";

export function useTerapeutaPacientes({ go }: { go: (v: View) => void }) {
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
return { go, selected, setSelected, expTab, setExpTab, search, setSearch, expandedSession, setExpandedSession, showAddObj, setShowAddObj, objectives, setObjectives, newObj, setNewObj, actSubTab, setActSubTab, resSubTab, setResSubTab, resFilterDesde, setResFilterDesde, resFilterHasta, setResFilterHasta, resFilterMundo, setResFilterMundo, resFilterTipo, setResFilterTipo, resFilterBuscar, setResFilterBuscar, resRapido, setResRapido, expandedRes, setExpandedRes, expandedSesAct, setExpandedSesAct, showGenReport, setShowGenReport, reportPeriod, setReportPeriod, reportType, setReportType, reportNotes, setReportNotes, noteType, setNoteType, noteText, setNoteText, noteTitle, setNoteTitle, savedNotes, setSavedNotes };
}
