export interface ReviewedArticulationResult {
  objetivo_articulacion: string;
  palabra_esperada: string;
  transcripcion_tentativa: string;
  resultado_revisado: string;
  archivo_origen: string;
  inicio_segundo: number;
  fin_segundo: number;
  /** Similitud de texto (0-100), indicador de apoyo sin validación clínica. Solo de evaluaciones confirmadas. */
  similitud_apoyo?: number;
}

export interface SavedArticulationResult extends ReviewedArticulationResult {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
}

const OPEN_MARKER = '[Resultado de articulación: análisis clínico]';
const CLOSE_MARKER = '[/Resultado de articulación]';

/** Etiqueta obligatoria de los indicadores de apoyo; el servidor la usa para ocultar esta línea a la familia. */
const SIMILARITY_LABEL = 'Indicador de apoyo · sin validación clínica';
/** Etiqueta usada por informes anteriores: se sigue reconociendo al leer y al ocultar. */
const LEGACY_SIMILARITY_LABEL = 'Similitud de texto (indicador de apoyo, sin validación clínica)';

/** Quita la línea de similitud de un texto que puede llegar a la familia (p. ej. el plan publicado). */
export function removeSupportSimilarity(text: string): string {
  return text.split(/\r?\n/).filter((line) => {
    const trimmed = line.trimStart();
    return !trimmed.startsWith(`${SIMILARITY_LABEL}:`) && !trimmed.startsWith(`${LEGACY_SIMILARITY_LABEL}:`);
  }).join('\n');
}

const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

export function encodeArticulationResult(result: ReviewedArticulationResult): string {
  const values: Array<[string, string]> = [
    ['Objetivo de articulación', result.objetivo_articulacion],
    ['Palabra esperada', result.palabra_esperada],
    ['Transcripción tentativa del modelo', result.transcripcion_tentativa],
    ['Resultado revisado por terapeuta', result.resultado_revisado],
    ['Fuente de audio revisada', result.archivo_origen],
    ['Fragmento', `${result.inicio_segundo.toFixed(2)}–${result.fin_segundo.toFixed(2)} s`],
  ];
  if (typeof result.similitud_apoyo === 'number' && Number.isFinite(result.similitud_apoyo)) {
    values.push([SIMILARITY_LABEL, `${Math.round(Math.min(100, Math.max(0, result.similitud_apoyo)))} %`]);
  }
  return `${OPEN_MARKER}\n${values.map(([label, value]) => `${label}: ${oneLine(value)}`).join('\n')}\n${CLOSE_MARKER}`;
}

export function appendArticulationResultToObservations(
  current: string | null | undefined,
  result: ReviewedArticulationResult,
): string {
  const entry = encodeArticulationResult(result);
  const existing = current?.trim() ?? '';
  if (existing.includes(entry)) return current ?? '';
  return existing ? `${existing}\n\n${entry}` : entry;
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
    const source = fields.get('Fuente de audio revisada') ?? fields.get('Fuente confirmada por terapeuta');
    const fragment = fields.get('Fragmento')?.match(/([\d.]+)–([\d.]+)\s*s/);
    const similarity = (fields.get(SIMILARITY_LABEL) ?? fields.get(LEGACY_SIMILARITY_LABEL))?.match(/^(\d{1,3})\s*%$/);
    if (!objective || !expected || !tentative || !reviewed || !source || !fragment) continue;
    results.push({
      objetivo_articulacion: objective,
      palabra_esperada: expected,
      transcripcion_tentativa: tentative,
      resultado_revisado: reviewed,
      archivo_origen: source.replace(/^Pista local individual del participante\s*·\s*/, ''),
      inicio_segundo: Number(fragment[1]),
      fin_segundo: Number(fragment[2]),
      ...(similarity ? { similitud_apoyo: Number(similarity[1]) } : {}),
    });
  }
  return results;
}

export function parseArticulationHistory<T extends {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
  observaciones_iniciales?: string | null;
  objetivos_trabajados?: string | null;
}>(rows: T[]): SavedArticulationResult[] {
  return rows.flatMap((row) => {
    const reportText = [row.observaciones_iniciales, row.objetivos_trabajados]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .join('\n\n');
    return parseArticulationResults(reportText).map((result) => ({
      ...result,
      id_sesion: row.id_sesion,
      tipo_cita: row.tipo_cita,
      fecha_hora_inicio: row.fecha_hora_inicio,
    }));
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
