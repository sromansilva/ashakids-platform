export interface ReviewedArticulationResult {
  objetivo_articulacion: string;
  palabra_esperada: string;
  transcripcion_tentativa: string;
  resultado_revisado: string;
  archivo_origen: string;
  inicio_segundo: number;
  fin_segundo: number;
}

export interface SavedArticulationResult extends ReviewedArticulationResult {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
}

const OPEN_MARKER = '[Resultado de articulación: análisis clínico]';
const CLOSE_MARKER = '[/Resultado de articulación]';

const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

export function encodeArticulationResult(result: ReviewedArticulationResult): string {
  const values: Array<[string, string]> = [
    ['Objetivo de articulación', result.objetivo_articulacion],
    ['Palabra esperada', result.palabra_esperada],
    ['Transcripción tentativa del modelo', result.transcripcion_tentativa],
    ['Resultado revisado por terapeuta', result.resultado_revisado],
    ['Fuente confirmada por terapeuta', `Pista local individual del participante · ${result.archivo_origen}`],
    ['Fragmento', `${result.inicio_segundo.toFixed(2)}–${result.fin_segundo.toFixed(2)} s`],
  ];
  return `${OPEN_MARKER}\n${values.map(([label, value]) => `${label}: ${oneLine(value)}`).join('\n')}\n${CLOSE_MARKER}`;
}

export function parseArticulationResults(text: string | null | undefined): ReviewedArticulationResult[] {
  if (!text) return [];
  const results: ReviewedArticulationResult[] = [];
  const expression = new RegExp(`${escapeRegExp(OPEN_MARKER)}\\r?\\n([\\s\\S]*?)\\r?\\n${escapeRegExp(CLOSE_MARKER)}`, 'g');
  for (const match of text.matchAll(expression)) {
    const fields = new Map<string, string>();
    for (const line of match[1].split(/\r?\n/)) {
      const separator = line.indexOf(':');
      if (separator > 0) fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
    const objective = fields.get('Objetivo de articulación');
    const expected = fields.get('Palabra esperada');
    const tentative = fields.get('Transcripción tentativa del modelo');
    const reviewed = fields.get('Resultado revisado por terapeuta');
    const source = fields.get('Fuente confirmada por terapeuta');
    const fragment = fields.get('Fragmento')?.match(/([\d.]+)–([\d.]+)\s*s/);
    if (!objective || !expected || !tentative || !reviewed || !source || !fragment) continue;
    results.push({
      objetivo_articulacion: objective,
      palabra_esperada: expected,
      transcripcion_tentativa: tentative,
      resultado_revisado: reviewed,
      archivo_origen: source.replace(/^Pista local individual del participante\s*·\s*/, ''),
      inicio_segundo: Number(fragment[1]),
      fin_segundo: Number(fragment[2]),
    });
  }
  return results;
}

export function parseArticulationHistory<T extends {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
  objetivos_trabajados: string;
}>(rows: T[]): SavedArticulationResult[] {
  return rows.flatMap((row) => parseArticulationResults(row.objetivos_trabajados).map((result) => ({
    ...result,
    id_sesion: row.id_sesion,
    tipo_cita: row.tipo_cita,
    fecha_hora_inicio: row.fecha_hora_inicio,
  })));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
