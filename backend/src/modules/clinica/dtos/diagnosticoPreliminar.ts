/**
 * Catálogo institucional de códigos diagnósticos preliminares (docs/Tareas_Implementacion).
 * Es independiente del modelo: lo elige el terapeuta y se guarda con el plan. Debe coincidir
 * exactamente con `diagnosis_codebook` del manifiesto del modelo aprobado (ver ml-artifacts/README.md).
 * No es un diagnóstico clínico confirmado ni lo emite el sistema.
 */
export const ETIQUETA_DIAGNOSTICO_PRELIMINAR = 'Código diagnóstico preliminar asignado por el terapeuta';

export const AVISO_DIAGNOSTICO_PRELIMINAR =
  'Es una clasificación preliminar elegida por el terapeuta para organizar el plan; no sustituye una evaluación diagnóstica.';

export const DIAGNOSTICOS_PRELIMINARES: ReadonlyArray<{ code: number; label: string }> = [
  { code: 0, label: 'Dislalia funcional' },
  { code: 1, label: 'Retraso simple del habla' },
  { code: 2, label: 'Trastorno del lenguaje (TEL)' },
  { code: 3, label: 'Deglución atípica' },
];

export const CODIGO_DIAGNOSTICO_MIN = 0;
export const CODIGO_DIAGNOSTICO_MAX = 3;

export function esCodigoDiagnosticoPreliminar(value: unknown): value is number {
  return typeof value === 'number' && DIAGNOSTICOS_PRELIMINARES.some((item) => item.code === value);
}

/** Compara el catálogo publicado por el modelo con el institucional (códigos y etiquetas exactos). */
export function catalogoCoincideConInstitucional(codes: unknown): boolean {
  if (!Array.isArray(codes) || codes.length !== DIAGNOSTICOS_PRELIMINARES.length) return false;
  return DIAGNOSTICOS_PRELIMINARES.every((expected) => codes.some((item: any) =>
    item?.code === expected.code && typeof item?.label === 'string' && item.label.trim() === expected.label));
}

/** Escala 1 (ayuda total) a 5 (autónomo): inversión del nivel de ayuda del informe. */
export const NIVELES_AYUDA = ['Sin ayuda', 'Ayuda mínima', 'Ayuda moderada', 'Ayuda alta', 'Ayuda total'] as const;

export function colaboracionDesdeNivelAyuda(nivelAyuda: unknown): number | null {
  const index = NIVELES_AYUDA.indexOf(String(nivelAyuda ?? '') as (typeof NIVELES_AYUDA)[number]);
  return index < 0 ? null : NIVELES_AYUDA.length - index;
}
