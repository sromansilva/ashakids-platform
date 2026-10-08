import { useState } from "react";

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
const sessions = [
    {
      id: 1,
      date: "30 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Pronunciación R", "Comprensión verbal"],
      notes:
        "Excelente progreso en R inicial. Se recomienda repetir ejercicios en casa.",
    },
    {
      id: 2,
      date: "23 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Vocabulario", "Lenguaje expresivo"],
      notes:
        "Amplió vocabulario a 12 nuevas palabras. Participó activamente.",
    },
    {
      id: 3,
      date: "16 Jul 2026",
      time: "10:30 AM",
      duration: "40 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Atención sostenida", "Comprensión"],
      notes:
        "Mejoró 15% en tiempo de atención sostenida. Excelente concentración.",
    },
    {
      id: 4,
      date: "9 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Pronunciación R", "Lectura"],
      notes:
        "Leyó su primer cuento completo. Gran logro emocional para la familia.",
    },
    {
      id: 5,
      date: "2 Jul 2026",
      time: "10:00 AM",
      duration: "45 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Vocabulario", "Comprensión verbal"],
      notes:
        "Trabajó con tarjetas de imágenes. Identificó 20 nuevas palabras.",
    },
    {
      id: 6,
      date: "25 Jun 2026",
      time: "10:30 AM",
      duration: "40 min",
      therapist: "Dra. Ana Ruiz",
      type: "virtual",
      goals: ["Lenguaje expresivo", "Frases"],
      notes:
        "Construyó frases de 5-6 palabras con estructura correcta.",
    },
  ];
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
return { tab, setTab, toast, setToast, openSession, setOpenSession, reportViewId, setReportViewId, showToast, sessions, reports, selectedReport, downloadPdf, downloadReport };
}
