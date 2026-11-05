/**
 * Indicadores de apoyo calculados a partir de TEXTO (palabra objetivo vs. transcripción).
 *
 * Son sugerencias sin validación clínica: no miden acústica ni pronunciación, y no pueden
 * detectar distorsiones. El terapeuta debe confirmarlas o descartarlas. Este módulo es puro
 * (sin acceso a base de datos ni a la red) y es la única fuente de estos valores: el cliente
 * nunca los envía.
 */

export type TipoErrorSugerido = 'SIN_DIFERENCIA' | 'SUSTITUCION' | 'OMISION' | 'ADICION' | 'MIXTO';

export interface IndicadoresFoneticos {
  similitud_texto_porcentaje: number;
  tipo_error_sugerido: TipoErrorSugerido;
  hipotesis_sugerida: string | null;
}

export const ETIQUETA_INDICADOR_APOYO = 'Indicador de apoyo · sin validación clínica';

/** Debe coincidir con la etiqueta que escribe frontend/src/shared/application/articulationReportEntries.ts. */
const ETIQUETA_SIMILITUD_INFORME = 'Similitud de texto (indicador de apoyo, sin validación clínica)';

/** Quita del texto de un informe la línea de similitud pegada: la familia nunca debe recibirla. */
export function quitarIndicadoresDelInforme(text: string): string;
export function quitarIndicadoresDelInforme(text: string | null): string | null;
export function quitarIndicadoresDelInforme(text: string | null): string | null {
  if (text == null) return null;
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith(`${ETIQUETA_SIMILITUD_INFORME}:`))
    .join('\n');
}

export const HIPOTESIS = {
  LAMBDACISMO: 'Posible lambdacismo',
  ROTACISMO: 'Posible rotacismo',
  SIGMATISMO: 'Posible sigmatismo',
  REDUCCION_SINFON: 'Posible reducción de sinfón',
} as const;

/**
 * Contenido del informe que puede recibir cada rol. La familia solo ve informes firmados y sin
 * indicadores de apoyo; un borrador puede contener transcripciones aún sin revisar.
 */
export function contenidoInformeParaRol(
  informe: { observaciones: string | null; objetivos: string | null; estado: string | null },
  rol: string,
): { observaciones: string; objetivos: string | null } {
  if (rol !== 'PADRE') return { observaciones: informe.observaciones ?? '', objetivos: informe.objetivos };
  if (informe.estado !== 'FIRMADO') return { observaciones: '', objetivos: null };
  return { observaciones: quitarIndicadoresDelInforme(informe.observaciones ?? ''), objetivos: informe.objetivos };
}

type Op =
  | { op: 'match'; target: number; heard: string }
  | { op: 'sub'; target: number; heard: string }
  | { op: 'del'; target: number }
  | { op: 'ins'; heard: string };

/**
 * Normalización aproximada a fonemas del español latinoamericano. Símbolos especiales:
 * R = vibrante múltiple, C = africada /tʃ/, N = /ɲ/. No pretende ser una transcripción IPA.
 */
export function normalizarFonemas(text: string): string {
  const base = text
    .toLocaleLowerCase('es')
    .replace(/ñ/g, '~')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/~/g, 'N')
    .replace(/[^a-zN]/g, '');
  return base
    .replace(/ch/g, 'C')
    .replace(/ll/g, 'y')
    .replace(/rr/g, 'R')
    .replace(/qu/g, 'k')
    // Primero g+e/i → j; así la g de «gue/gui» conserva su sonido al quitar la u.
    .replace(/g(?=[ei])/g, 'j')
    .replace(/gu(?=[ei])/g, 'g')
    .replace(/c(?=[ei])/g, 's')
    .replace(/z/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/v/g, 'b')
    .replace(/w/g, 'u')
    .replace(/h/g, '')
    .replace(/^r/, 'R')
    .replace(/(?<=[nls])r/g, 'R');
}

function alinear(target: string[], heard: string[]): { distancia: number; ops: Op[] } {
  const n = target.length;
  const m = heard.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 0; i <= n; i += 1) dp[i][0] = i;
  for (let j = 0; j <= m; j += 1) dp[0][j] = j;
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const cost = target[i - 1] === heard[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = target[i - 1] === heard[j - 1];
      if (dp[i][j] === dp[i - 1][j - 1] + (same ? 0 : 1)) {
        ops.push({ op: same ? 'match' : 'sub', target: i - 1, heard: heard[j - 1] });
        i -= 1;
        j -= 1;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ op: 'del', target: i - 1 });
      i -= 1;
      continue;
    }
    ops.push({ op: 'ins', heard: heard[j - 1] });
    j -= 1;
  }
  return { distancia: dp[n][m], ops: ops.reverse() };
}

function tipoDeError(ops: Op[]): TipoErrorSugerido {
  const subs = ops.filter((item) => item.op === 'sub').length;
  const dels = ops.filter((item) => item.op === 'del').length;
  const ins = ops.filter((item) => item.op === 'ins').length;
  const kinds = [subs, dels, ins].filter((count) => count > 0).length;
  if (kinds === 0) return 'SIN_DIFERENCIA';
  if (kinds > 1) return 'MIXTO';
  if (subs > 0) return 'SUSTITUCION';
  return dels > 0 ? 'OMISION' : 'ADICION';
}

function hipotesisPara(fonemaObjetivo: string | null | undefined, target: string[], ops: Op[]): string | null {
  const opEn = (index: number) => ops.find((item) => 'target' in item && item.target === index);

  if (fonemaObjetivo === '/r/' || fonemaObjetivo === '/rr/') {
    let hipotesis: string | null = null;
    target.forEach((symbol, index) => {
      if (symbol !== 'r' && symbol !== 'R') return;
      const item = opEn(index);
      if (!item || item.op === 'match') return;
      if (item.op === 'sub' && item.heard === 'l') {
        hipotesis = HIPOTESIS.LAMBDACISMO;
      } else if (hipotesis === null) {
        hipotesis = HIPOTESIS.ROTACISMO;
      }
    });
    return hipotesis;
  }

  if (fonemaObjetivo === '/s/') {
    const afectado = target.some((symbol, index) => {
      if (symbol !== 's') return false;
      const item = opEn(index);
      return Boolean(item && item.op !== 'match');
    });
    return afectado ? HIPOTESIS.SIGMATISMO : null;
  }

  if (fonemaObjetivo === '/pl/' || fonemaObjetivo === '/tr/') {
    const cluster = fonemaObjetivo.slice(1, 3);
    const start = target.join('').indexOf(cluster);
    if (start < 0) return null;
    const reducido = [start, start + 1].some((index) => opEn(index)?.op === 'del');
    return reducido ? HIPOTESIS.REDUCCION_SINFON : null;
  }

  return null;
}

/**
 * Calcula los indicadores de apoyo. Una transcripción vacía (o sin letras) devuelve
 * similitud 0, OMISION y ninguna hipótesis: sin texto no hay evidencia para sugerir nada.
 */
export function calcularIndicadoresFoneticos(input: {
  palabra_objetivo: string;
  fonema_objetivo?: string | null;
  transcripcion: string;
}): IndicadoresFoneticos {
  const target = Array.from(normalizarFonemas(input.palabra_objetivo));
  const heard = Array.from(normalizarFonemas(input.transcripcion));

  if (target.length === 0 || heard.length === 0) {
    return {
      similitud_texto_porcentaje: target.length === 0 && heard.length === 0 ? 100 : 0,
      tipo_error_sugerido: target.length === 0 && heard.length === 0 ? 'SIN_DIFERENCIA' : heard.length === 0 ? 'OMISION' : 'ADICION',
      hipotesis_sugerida: null,
    };
  }

  const { distancia, ops } = alinear(target, heard);
  const similitud = Math.round((1 - distancia / Math.max(target.length, heard.length)) * 100);
  return {
    similitud_texto_porcentaje: Math.min(100, Math.max(0, similitud)),
    tipo_error_sugerido: tipoDeError(ops),
    hipotesis_sugerida: hipotesisPara(input.fonema_objetivo, target, ops),
  };
}
