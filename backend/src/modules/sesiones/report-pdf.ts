export interface ReportPdfContent {
  sessionId: number;
  patientName: string;
  therapistName: string;
  sessionDate: string;
  observations: string | null;
  objectives: string | null;
  helpLevel: string | null;
  nextSteps: string | null;
  reportStatus: 'BORRADOR' | 'FIRMADO';
  signedBy: string | null;
  signedAt: string | null;
}

function pdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrap(value: string | null, width = 86): string[] {
  const text = pdfText(value || 'Sin información registrada.');
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (candidate.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function buildReportPdf(report: ReportPdfContent): Buffer {
  const bodyLines = [
    'AshaKids - Informe de sesion',
    'Sesion: #' + report.sessionId,
    'Paciente: ' + pdfText(report.patientName),
    'Terapeuta: ' + pdfText(report.therapistName),
    'Fecha: ' + pdfText(report.sessionDate),
    'Estado del reporte: ' + report.reportStatus,
    ...(report.reportStatus === 'FIRMADO'
      ? ['Firmado por: ' + pdfText(report.signedBy || 'Terapeuta'), 'Fecha de firma: ' + pdfText(report.signedAt || '')] : ['BORRADOR - Pendiente de firma']),
    '',
    'Observaciones iniciales:',
    ...wrap(report.observations),
    '',
    'Objetivos trabajados:',
    ...wrap(report.objectives),
    '',
    'Nivel de ayuda:',
    ...wrap(report.helpLevel),
    '',
    'Proximos pasos:',
    ...wrap(report.nextSteps),
    '',
    'Documento generado a partir del reporte guardado en AshaKids.',
  ];
  const pageLines = 48;
  const pages: string[][] = [];
  for (let index = 0; index < bodyLines.length; index += pageLines) {
    pages.push(bodyLines.slice(index, index + pageLines));
  }

  const objects: string[] = [];
  const pageRefs = pages.map((_, index) => (4 + index * 2) + ' 0 R').join(' ');
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [' + pageRefs + '] /Count ' + pages.length + ' >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

  pages.forEach((lines, index) => {
    const pageId = 4 + index * 2;
    const streamId = pageId + 1;
    const commands = [
      'BT',
      '/F1 16 Tf',
      '50 760 Td',
      '(AshaKids - Informe de sesion) Tj',
      '/F1 10 Tf',
      '0 -26 Td',
      ...lines.map((line, lineIndex) => (lineIndex === 0 ? '(' + pdfText(line) + ') Tj' : '0 -14 Td (' + pdfText(line) + ') Tj')),
      'ET',
    ].join('\n');
    objects[pageId] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + streamId + ' 0 R >>';
    objects[streamId] = '<< /Length ' + Buffer.byteLength(commands, 'ascii') + ' >>\nstream\n' + commands + '\nendstream';
  });

  let document = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(document, 'ascii');
    document += id + ' 0 obj\n' + objects[id] + '\nendobj\n';
  }
  const xrefOffset = Buffer.byteLength(document, 'ascii');
  document += 'xref\n0 ' + objects.length + '\n0000000000 65535 f \n';
  for (let id = 1; id < objects.length; id += 1) {
    document += String(offsets[id]).padStart(10, '0') + ' 00000 n \n';
  }
  document += 'trailer\n<< /Size ' + objects.length + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
  return Buffer.from(document, 'ascii');
}
