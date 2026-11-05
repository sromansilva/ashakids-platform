import { PHONEME_NAMING_TARGETS } from '../../juegos/juegos.service.js';
import { colaboracionDesdeNivelAyuda, esCodigoDiagnosticoPreliminar } from '../dtos/diagnosticoPreliminar.js';

/** Cliente o pool de pg; sirve tanto dentro de una transacción como fuera de ella. */
export interface Consultable {
  query: (sql: string, values?: unknown[]) => Promise<{ rows: any[]; rowCount?: number | null }>;
}

/**
 * Fonemas afectados de una sesión: solo evaluaciones CLINICAS CONFIRMADAS por el terapeuta
 * cuyo resultado indica que el fonema aún requiere trabajo. Las pendientes, descartadas,
 * lúdicas o ya alcanzadas no cuentan. Es la única definición, usada por el pronóstico y por la captura del plan.
 */
export async function contarFonemasAfectados(db: Consultable, idSesion: number, idPaciente: number): Promise<number> {
  const supported = Array.from(new Set(PHONEME_NAMING_TARGETS.map((target) => target.fonema_objetivo)));
  const result = await db.query(
    `SELECT COUNT(DISTINCT fonema_objetivo)::integer AS cantidad
     FROM public.evaluaciones_fonologicas
     WHERE id_sesion = $1 AND id_paciente = $2
       AND estado = 'CONFIRMADO_TERAPEUTA'
       AND origen_evaluacion = 'CLINICO'
       AND resultado_clinico IN ('EN_PROCESO', 'REQUIERE_APOYO')
       AND fonema_objetivo = ANY($3::varchar[]);`,
    [idSesion, idPaciente, supported],
  );
  return Number(result.rows[0]?.cantidad ?? 0);
}

/**
 * Calcula y guarda, dentro de la transacción del llamador, las variables del plan que alimentan
 * el entrenamiento futuro. Todo sale de datos del servidor; el cliente solo aporta el código diagnóstico
 * preliminar. Debe llamarse justo después de insertar el tratamiento (ver sesiones.service.publicarPlan).
 */
export async function registrarVariablesModeloTratamiento(
  db: Consultable,
  input: { idTratamiento: number; codigoDiagnostico: number },
) {
  if (!esCodigoDiagnosticoPreliminar(input.codigoDiagnostico)) {
    throw Object.assign(new Error('Selecciona un código diagnóstico preliminar válido.'), { status: 400 });
  }
  const context = await db.query(
    `SELECT t.id_sesion_origen, t.frecuencia_semanal, t.id_prediccion, r.id_paciente,
            (EXTRACT(YEAR FROM AGE(COALESCE(s.fecha_hora_inicio_real, NOW())::date, p.fecha_nacimiento)) * 12
              + EXTRACT(MONTH FROM AGE(COALESCE(s.fecha_hora_inicio_real, NOW())::date, p.fecha_nacimiento)))::integer AS edad_meses,
            report.nivel_ayuda,
            pred.codigo_diagnostico AS codigo_prediccion
     FROM public.tratamientos t
     JOIN public.sesiones s ON s.id_sesion = t.id_sesion_origen
     JOIN public.reservas r ON r.id_reserva = s.id_reserva
     JOIN public.pacientes p ON p.id_paciente = r.id_paciente
     LEFT JOIN public.reportes_sesion report ON report.id_sesion = s.id_sesion
     LEFT JOIN public.predicciones_tratamiento pred ON pred.id_prediccion = t.id_prediccion
     WHERE t.id_tratamiento = $1
     LIMIT 1;`,
    [input.idTratamiento],
  );
  const row = context.rows[0];
  if (!row) {
    throw Object.assign(new Error('El plan debe nacer de una sesión atendida para registrar sus variables.'), { status: 409 });
  }
  if (row.codigo_prediccion != null && Number(row.codigo_prediccion) !== input.codigoDiagnostico) {
    throw Object.assign(
      new Error('El código diagnóstico del plan debe coincidir con el usado para solicitar el pronóstico.'),
      { status: 409 },
    );
  }
  const fonemas = await contarFonemasAfectados(db, Number(row.id_sesion_origen), Number(row.id_paciente));
  await db.query(
    `INSERT INTO public.tratamiento_variables_modelo (
       id_tratamiento, edad_meses, codigo_diagnostico, cantidad_fonemas_afectados, nivel_colaboracion, frecuencia_semanal
     ) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id_tratamiento) DO UPDATE SET
       edad_meses = EXCLUDED.edad_meses,
       codigo_diagnostico = EXCLUDED.codigo_diagnostico,
       cantidad_fonemas_afectados = EXCLUDED.cantidad_fonemas_afectados,
       nivel_colaboracion = EXCLUDED.nivel_colaboracion,
       frecuencia_semanal = EXCLUDED.frecuencia_semanal,
       fecha_captura = now();`,
    [
      input.idTratamiento,
      row.edad_meses == null ? null : Number(row.edad_meses),
      input.codigoDiagnostico,
      fonemas,
      colaboracionDesdeNivelAyuda(row.nivel_ayuda),
      row.frecuencia_semanal == null ? null : Number(row.frecuencia_semanal),
    ],
  );
  return {
    codigo_diagnostico: input.codigoDiagnostico,
    cantidad_fonemas_afectados: fonemas,
    nivel_colaboracion: colaboracionDesdeNivelAyuda(row.nivel_ayuda),
    frecuencia_semanal: row.frecuencia_semanal == null ? null : Number(row.frecuencia_semanal),
    edad_meses: row.edad_meses == null ? null : Number(row.edad_meses),
  };
}
