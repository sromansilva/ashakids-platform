import { useState } from "react";
import { useRemote } from "@/hooks/useRemoteData";
import { sessionsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";

export function usePadreReportes() {
const [tab, setTab] = useState<"sesiones" | "progreso">(
    "sesiones",
  );
const [toast, setToast] = useState("");
const [openSession, setOpenSession] = useState<number | null>(
    null,
  );
const [reportViewId, setReportViewId] = useState<
    number | null
  >(null);
const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };
const sessionsQuery = useRemote(['sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
const sessions = (sessionsQuery.data ?? []).map(s => ({
  id: s.id_sesion, appointmentId: s.id_reserva, patient: s.cita.paciente_nombre,
  date: new Date(s.cita.fecha_hora_inicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
  time: new Date(s.cita.fecha_hora_inicio).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' }),
  duration: s.fecha_hora_inicio_real && s.fecha_hora_fin_real ? `${Math.round((Date.parse(s.fecha_hora_fin_real) - Date.parse(s.fecha_hora_inicio_real))/60000)} min` : 'Sin duración registrada',
  therapist: s.cita.terapeuta_nombre, type: s.cita.modalidad === 'VIRTUAL' ? 'virtual' : 'presencial',
  goals: [] as string[], notes: '', state: s.estado_sesion,
}));
const reports = [
    {
      id: 1,
      title: "Informe Mensual — Julio 2026",
      date: "31 Jul 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Avance significativo en pronunciación y comprensión verbal. Racha de 7 días activos en Mundo ASHA.",
      fav: true,
    },
    {
      id: 2,
      title: "Informe Mensual — Junio 2026",
      date: "30 Jun 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Vocabulario expresivo alcanzó el 90%. Se completó el objetivo de lenguaje receptivo del plan mensual.",
      fav: false,
    },
    {
      id: 3,
      title: "Evaluación Inicial — Enero 2026",
      date: "15 Ene 2026",
      therapist: "Dra. Ana Ruiz",
      status: "completado",
      summary:
        "Diagnóstico funcional de inicio. Línea base establecida para plan terapéutico individualizado.",
      fav: true,
    },
    {
      id: 4,
      title: "Plan Terapéutico Q3 2026",
      date: "1 Jul 2026",
      therapist: "Dra. Ana Ruiz",
      status: "activo",
      summary:
        "Objetivos para el tercer trimestre: pronunciación avanzada, comprensión verbal y lenguaje expresivo.",
      fav: false,
    },
  ];
const selectedReport =
    reportViewId !== null
      ? (reports.find((r) => r.id === reportViewId) ?? null)
      : null;
const downloadPdf = (filename: string, title: string, lines: string[]) => {
    const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\()]/g, "\\$&");
    const body = ["BT", "/F1 18 Tf", "50 790 Td", `(${safe(title)}) Tj`, "/F1 10 Tf",
      ...lines.slice(0, 40).flatMap(l => ["0 -20 Td", `(${safe(l)}) Tj`]), "ET"].join("\n");
    const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
    const offsets: number[] = []; let pdf = "%PDF-1.4\n";
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
const downloadReport = (r: (typeof reports)[0]) => {
    downloadPdf(`informe-${r.id}.pdf`, r.title, [
      `Fecha: ${r.date}`, `Terapeuta: ${r.therapist}`, `Estado: ${r.status}`,
      `Paciente: Mateo Gomez  7 anos`, "", "Resumen:", r.summary, "",
      "Objetivos del periodo:", "  - Pronunciacion y articulacion", "  - Comprension verbal y vocabulario",
      "  - Lenguaje expresivo funcional", "", "Observaciones:", "  Avance consistente segun plan terapeutico.",
      "  Se recomienda continuar con actividades en Mundo ASHA.", "", "Firma digital: Dra. Ana Ruiz - ASHAKids",
    ]);
    showToast(`Descargando "${r.title}"...`);
  };
return { sessionsQuery, tab, setTab, toast, setToast, openSession, setOpenSession, reportViewId, setReportViewId, showToast, sessions, reports, selectedReport, downloadPdf, downloadReport };
}
