import { useState } from "react";
import { View } from "@/types/navigation";

export function useAshaSessionEnd({ go }: { go: (v: View) => void }) {
const [showSummaryModal, setShowSummaryModal] = useState(false);
const [showForm, setShowForm] = useState(false);
const [formStep, setFormStep] = useState(0);
const [formData, setFormData] = useState({
    // Step 0 - General data
    fecha: new Date().toISOString().split("T")[0],
    hora: "10:00",
    duracion: "45",
    asistencia: "asistio" as "asistio" | "ausencia-justificada" | "ausencia-no-justificada",
    tema: "",
    // Step 1 - Objectives
    objetivos: [] as string[],
    // Step 2 - Objective performance per selected objective
    desempeno: {} as Record<string, { intentos: string; correctas: string; nivel: string; obs: string; estado: string }>,
    // Step 3 - Activities from catalog
    actividadesSeleccionadas: [] as string[],
    actividadesDetalle: {} as Record<string, { estado: string; contexto: string; objetivo: string; intentos: string; resultado: string; nivel: string; obs: string }>,
    // Step 4 - Session note
    resumen: "",
    avances: "",
    dificultades: "",
    recomendaciones: "",
    proximosPasos: "",
    notaPrivada: "",
    compartirResumen: false,
  });
const [formSaved, setFormSaved] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);
const downloadSessionPdf = () => {
    const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\()]/g, "\\$&");
    const lines = [
      "Sesion Finalizada - 30 Jul 2026",
      "Terapeuta: Dra. Ana Ruiz",
      "Duracion: 45 minutos  Inicio: 10:00 AM",
      "", "Objetivos trabajados:",
      "  - Pronunciacion de la R",
      "  - Comprension verbal",
      "  - Juego interactivo",
      "", "Notas del terapeuta:",
      "  Excelente progreso en R inicial. Continuar ejercicios en casa.",
      "", "Proxima sesion: pendiente de confirmar",
      "", "ASHAKids - Plataforma de terapia infantil",
    ];
    const body = ["BT", "/F1 16 Tf", "50 790 Td", `(${safe("Resumen de sesion - ASHAKids")}) Tj`, "/F1 10 Tf",
      ...lines.flatMap(l => ["0 -20 Td", `(${safe(l)}) Tj`]), "ET"].join("\n");
    const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    a.href = url; a.download = "resumen-sesion-30jul2026.pdf";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
return { go, showSummaryModal, setShowSummaryModal, showForm, setShowForm, formStep, setFormStep, formData, setFormData, formSaved, setFormSaved, showConfirm, setShowConfirm, downloadSessionPdf };
}
