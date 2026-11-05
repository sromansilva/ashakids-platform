import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';

type Row = Record<string, any>;

/**
 * Serializa una evaluación fonológica según el rol. Los indicadores de apoyo (similitud, tipo
 * de error, hipótesis, intentos y nota rápida) son solo para el equipo clínico: la familia
 * (PADRE) nunca los recibe.
 */
export function serializarEvaluacionFonologica(r: Row, rol: AuthenticatedUser['rol'] | string) {
  const esPadre = rol === 'PADRE';
  const base = {
    id_evaluacion: r.id_evaluacion,
    id_sesion: r.id_sesion,
    id_paciente: r.id_paciente,
    fonema_objetivo: r.fonema_objetivo,
    palabra_objetivo: r.palabra_objetivo,
    transcripcion_detectada: esPadre ? r.transcripcion_revisada : r.transcripcion_detectada,
    nivel_ayuda: r.nivel_ayuda,
    estado: r.estado,
    origen_evaluacion: r.origen_evaluacion,
    resultado_clinico: r.resultado_clinico ?? null,
    fecha_registro: new Date(r.fecha_registro).toISOString(),
  };
  if (esPadre) return { ...base, observacion_terapeuta: r.observacion_terapeuta };
  return {
    ...base,
    transcripcion_revisada: r.transcripcion_revisada,
    observacion_terapeuta: r.observacion_terapeuta,
    similitud_texto_porcentaje: r.similitud_porcentaje == null ? null : Number(r.similitud_porcentaje),
    tipo_error_sugerido: r.tipo_error_sugerido ?? null,
    hipotesis_sugerida: r.diagnostico_sugerido ?? null,
    intentos: r.intentos == null ? null : Number(r.intentos),
    nota_rapida: r.nota_rapida ?? null,
  };
}
