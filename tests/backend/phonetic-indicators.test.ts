import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularIndicadoresFoneticos, contenidoInformeParaRol, normalizarFonemas, quitarIndicadoresDelInforme } from '../../backend/src/modules/clinica/services/phoneticIndicators.ts';
import { serializarEvaluacionFonologica } from '../../backend/src/modules/clinica/services/evaluacionFonologicaView.ts';
import { evaluacionFonologicaSchema, revisionEvaluacionFonologicaSchema } from '../../backend/src/modules/clinica/dtos/clinica.dto.ts';

test('la g de «gue/gui» no se confunde con la j', () => {
  assert.notEqual(normalizarFonemas('guitarra'), normalizarFonemas('jitarra'));
  assert.equal(normalizarFonemas('gitano'), normalizarFonemas('jitano'));
});

test('la familia no recibe la línea de similitud pegada en el informe', () => {
  const informe = [
    '[Resultado de articulación: análisis clínico]',
    'Palabra esperada: carro',
    'Similitud de texto (indicador de apoyo, sin validación clínica): 75 %',
    '[/Resultado de articulación]',
  ].join('\n');
  const paraFamilia = quitarIndicadoresDelInforme(informe);
  assert.ok(!paraFamilia.includes('Similitud'));
  assert.ok(paraFamilia.includes('Palabra esperada: carro'));
  assert.equal(quitarIndicadoresDelInforme(null), null);
});

test('la familia no recibe contenido de informes sin firmar; el equipo clínico sí', () => {
  const borrador = { observaciones: 'Transcripción tentativa: calo', objetivos: 'Trabajar /r/', estado: 'BORRADOR' };
  assert.deepEqual(contenidoInformeParaRol(borrador, 'PADRE'), { observaciones: '', objetivos: null });
  assert.deepEqual(contenidoInformeParaRol({ ...borrador, estado: null }, 'PADRE'), { observaciones: '', objetivos: null });
  assert.deepEqual(contenidoInformeParaRol(borrador, 'TERAPEUTA'), { observaciones: borrador.observaciones, objetivos: borrador.objetivos });
  assert.deepEqual(contenidoInformeParaRol(borrador, 'ADMIN'), { observaciones: borrador.observaciones, objetivos: borrador.objetivos });

  const firmado = {
    observaciones: 'Palabra esperada: carro\nSimilitud de texto (indicador de apoyo, sin validación clínica): 75 %',
    objetivos: 'Trabajar /r/',
    estado: 'FIRMADO',
  };
  assert.deepEqual(contenidoInformeParaRol(firmado, 'PADRE'), { observaciones: 'Palabra esperada: carro', objetivos: 'Trabajar /r/' });
});

test('carro/calo: sustitución de vibrante por lateral sugiere lambdacismo', () => {
  const result = calcularIndicadoresFoneticos({ palabra_objetivo: 'Carro', fonema_objetivo: '/rr/', transcripcion: 'calo' });
  assert.equal(result.tipo_error_sugerido, 'SUSTITUCION');
  assert.equal(result.hipotesis_sugerida, 'Posible lambdacismo');
  assert.equal(result.similitud_texto_porcentaje, 75);
});

test('sustituir /r/ por otro sonido o omitirla sugiere rotacismo', () => {
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Carro', fonema_objetivo: '/rr/', transcripcion: 'cado' }).hipotesis_sugerida, 'Posible rotacismo');
  const omision = calcularIndicadoresFoneticos({ palabra_objetivo: 'Flor', fonema_objetivo: '/r/', transcripcion: 'flo' });
  assert.equal(omision.tipo_error_sugerido, 'OMISION');
  assert.equal(omision.hipotesis_sugerida, 'Posible rotacismo');
});

test('diferencias solo ortográficas no se marcan: zapato/sapato es 100 %', () => {
  const result = calcularIndicadoresFoneticos({ palabra_objetivo: 'Zapato', fonema_objetivo: '/s/', transcripcion: 'sapato' });
  assert.deepEqual(result, { similitud_texto_porcentaje: 100, tipo_error_sugerido: 'SIN_DIFERENCIA', hipotesis_sugerida: null });
  assert.equal(normalizarFonemas('queso'), normalizarFonemas('keso'));
  assert.equal(normalizarFonemas('vaca'), normalizarFonemas('baca'));
  assert.equal(normalizarFonemas('Ratón'), normalizarFonemas('rratón'));
  assert.equal(normalizarFonemas('hola'), normalizarFonemas('ola'));
});

test('/s/ omitida o sustituida sugiere sigmatismo', () => {
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Sol', fonema_objetivo: '/s/', transcripcion: 'tol' }).hipotesis_sugerida, 'Posible sigmatismo');
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Sol', fonema_objetivo: '/s/', transcripcion: 'ol' }).tipo_error_sugerido, 'OMISION');
});

test('plato/pato sugiere reducción de sinfón; tren/ten también', () => {
  const plato = calcularIndicadoresFoneticos({ palabra_objetivo: 'Plato', fonema_objetivo: '/pl/', transcripcion: 'pato' });
  assert.equal(plato.tipo_error_sugerido, 'OMISION');
  assert.equal(plato.hipotesis_sugerida, 'Posible reducción de sinfón');
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Tren', fonema_objetivo: '/tr/', transcripcion: 'ten' }).hipotesis_sugerida, 'Posible reducción de sinfón');
});

test('adición y errores mixtos; nunca se sugiere distorsión', () => {
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Sol', fonema_objetivo: '/s/', transcripcion: 'sola' }).tipo_error_sugerido, 'ADICION');
  assert.equal(calcularIndicadoresFoneticos({ palabra_objetivo: 'Zapato', fonema_objetivo: '/s/', transcripcion: 'tapat' }).tipo_error_sugerido, 'MIXTO');
});

test('transcripción vacía: similitud 0, omisión y sin hipótesis', () => {
  for (const transcripcion of ['', '   ', '...']) {
    assert.deepEqual(
      calcularIndicadoresFoneticos({ palabra_objetivo: 'Carro', fonema_objetivo: '/rr/', transcripcion }),
      { similitud_texto_porcentaje: 0, tipo_error_sugerido: 'OMISION', hipotesis_sugerida: null },
    );
  }
});

test('el cliente no puede enviar indicadores calculados por el servidor', () => {
  const valid = { id_sesion: 1, id_paciente: 2, palabra_objetivo: 'carro', transcripcion_detectada: 'calo' };
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, intentos: 2, nota_rapida: 'Necesitó modelado' }).success, true);
  for (const extra of [{ tipo_error_sugerido: 'OMISION' }, { diagnostico_sugerido: 'x' }, { hipotesis_sugerida: 'x' }, { similitud_texto_porcentaje: 90 }]) {
    assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, ...extra }).success, false);
  }
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, intentos: 0 }).success, false);
  assert.equal(evaluacionFonologicaSchema.safeParse({ ...valid, nota_rapida: 'x'.repeat(501) }).success, false);
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse({ estado: 'DESCARTADO', similitud_porcentaje: 99 }).success, false);
  assert.equal(revisionEvaluacionFonologicaSchema.safeParse({ estado: 'DESCARTADO', intentos: 3, nota_rapida: 'ok' }).success, true);
});

const row = {
  id_evaluacion: 1, id_sesion: 2, id_paciente: 3, fonema_objetivo: '/rr/', palabra_objetivo: 'Carro',
  transcripcion_detectada: 'calo', transcripcion_revisada: 'calo', observacion_terapeuta: 'Sustituye /rr/.',
  nivel_ayuda: null, estado: 'CONFIRMADO_TERAPEUTA', origen_evaluacion: 'CLINICO', resultado_clinico: 'REQUIERE_APOYO',
  fecha_registro: '2026-11-05T10:00:00Z', similitud_porcentaje: '75.00', tipo_error_sugerido: 'SUSTITUCION',
  diagnostico_sugerido: 'Posible lambdacismo', intentos: 2, nota_rapida: 'Dos intentos',
};

test('PADRE no recibe similitud, tipo de error, hipótesis, intentos ni nota rápida', () => {
  const family = serializarEvaluacionFonologica(row, 'PADRE') as Record<string, unknown>;
  for (const key of ['similitud_texto_porcentaje', 'similitud_porcentaje', 'tipo_error_sugerido', 'hipotesis_sugerida', 'diagnostico_sugerido', 'intentos', 'nota_rapida', 'transcripcion_revisada']) {
    assert.equal(key in family, false, key);
  }
  assert.equal(JSON.stringify(family).includes('lambdacismo'), false);
});

test('TERAPEUTA y ADMIN reciben los indicadores de apoyo', () => {
  for (const rol of ['TERAPEUTA', 'ADMIN']) {
    const clinical = serializarEvaluacionFonologica(row, rol) as Record<string, unknown>;
    assert.equal(clinical.similitud_texto_porcentaje, 75);
    assert.equal(clinical.tipo_error_sugerido, 'SUSTITUCION');
    assert.equal(clinical.hipotesis_sugerida, 'Posible lambdacismo');
    assert.equal(clinical.intentos, 2);
    assert.equal(clinical.nota_rapida, 'Dos intentos');
  }
});
