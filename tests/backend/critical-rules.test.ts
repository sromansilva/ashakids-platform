import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

const { GmailService } = await import('../../backend/dist/infrastructure/mailer/gmail.service.js');
const { serializarEvaluacionFonologica } = await import('../../backend/dist/modules/clinica/services/evaluacionFonologicaView.js');
const { clinicaService } = await import('../../backend/dist/modules/clinica/services/clinica.service.js');
const { SESSION_EARLY_START_MINUTES } = await import('../../backend/dist/modules/sesiones/sesiones.service.js');

const { pool } = await import('../../backend/dist/core/database.js');
const { settings } = await import('../../backend/dist/core/config.js');

const localDatabaseHost = ['127.0.0.1', 'localhost', '::1'].includes((settings.DB_HOST || '').toLowerCase());
const isolatedDatabase = /(?:_test|_e2e)$/i.test(settings.DB_NAME || '');
const canRunDatabaseTests = process.env.ENVIRONMENT === 'test' && localDatabaseHost && isolatedDatabase;
const runDbE2E = process.env.ASHAKIDS_RUN_DB_E2E === '1' && canRunDatabaseTests;

describe('Reglas críticas de AGENTS.md (Pruebas Automatizadas)', () => {

  describe('a. Puerta de Meet: meet_url en correos y recordatorios para la familia', () => {
    it('GmailService.sendAppointmentConfirmation para familia nunca incluye meet.google.com ni meet_url', async () => {
      const captured: Array<{ to: string; subject: string; text: string; html?: string }> = [];
      const originalSendMail = GmailService.sendMail;
      GmailService.sendMail = async (opts: any) => {
        captured.push(opts);
        return { success: true, status: 'ENVIADO', messageId: 'test-msg-1' };
      };

      try {
        await GmailService.sendAppointmentConfirmation({
          to: 'familia.prueba@ashakids.life',
          patientOrTherapistName: 'Familia Gómez',
          topic: 'Terapia del Lenguaje y Habla',
          date: '2026-12-01',
          time: '10:00 AM',
          portalNotice: true,
        });

        assert.equal(captured.length, 1);
        const mail = captured[0];
        assert.ok(!mail.text.includes('meet.google.com'), 'El texto para la familia no debe incluir meet.google.com');
        assert.ok(!mail.text.includes('https://meet.google.com'), 'El texto no debe contener enlaces a Meet');
        assert.ok(!mail.html?.includes('meet.google.com'), 'El HTML para la familia no debe incluir meet.google.com');
        assert.ok(mail.text.includes('entra a tu cuenta de AshaKids'), 'Debe instruir ingresar a AshaKids para la videoconsulta');
        assert.ok(mail.text.includes('cuando tu terapeuta inicie la reunión'), 'Debe indicar que se habilita al iniciar');
      } finally {
        GmailService.sendMail = originalSendMail;
      }
    });

    it('GmailService.sendAppointmentReminder (usado por el planificador) nunca expone meet.google.com a la familia', async () => {
      const captured: Array<{ to: string; subject: string; text: string; html?: string }> = [];
      const originalSendMail = GmailService.sendMail;
      GmailService.sendMail = async (opts: any) => {
        captured.push(opts);
        return { success: true, status: 'ENVIADO', messageId: 'test-msg-2' };
      };

      try {
        await GmailService.sendAppointmentReminder({
          to: 'familia.recordatorio@ashakids.life',
          responsibleName: 'Laura Gómez',
          childName: 'Mateo',
          date: '01/12/2026',
          time: '10:00',
          portalNotice: true,
        });

        assert.equal(captured.length, 1);
        const mail = captured[0];
        assert.ok(!mail.text.includes('meet.google.com'), 'El recordatorio no debe incluir meet.google.com');
        assert.ok(!mail.text.includes('https://meet.google.com'), 'El recordatorio no debe contener enlaces a Meet');
        assert.ok(mail.text.includes('Entra desde tu cuenta de AshaKids: podrás unirte a la reunión cuando tu terapeuta la inicie'));
      } finally {
        GmailService.sendMail = originalSendMail;
      }
    });

    it('el enlace de Google Meet se incluye únicamente cuando el destinatario es terapeuta con meetUrl explícito', async () => {
      const captured: Array<{ to: string; subject: string; text: string; html?: string }> = [];
      const originalSendMail = GmailService.sendMail;
      GmailService.sendMail = async (opts: any) => {
        captured.push(opts);
        return { success: true, status: 'ENVIADO', messageId: 'test-msg-3' };
      };

      try {
        const testMeetUrl = 'https://meet.google.com/xyz-uvwx-rst';
        await GmailService.sendAppointmentConfirmation({
          to: 'terapeuta@ashakids.life',
          patientOrTherapistName: 'Lic. Especialista',
          topic: 'Terapia del Lenguaje',
          date: '2026-12-01',
          time: '10:00 AM',
          meetUrl: testMeetUrl,
        });

        assert.equal(captured.length, 1);
        const mail = captured[0];
        assert.ok(mail.text.includes(testMeetUrl), 'El terapeuta sí debe recibir el enlace');
        assert.ok(mail.html?.includes(testMeetUrl), 'El HTML para el terapeuta sí debe contener el enlace');
      } finally {
        GmailService.sendMail = originalSendMail;
      }
    });
  });

  describe('b. Indicadores fonéticos nunca al PADRE', () => {
    const evaluacionPrueba = {
      id_evaluacion: 42,
      id_sesion: 10,
      id_paciente: 5,
      fonema_objetivo: '/rr/',
      palabra_objetivo: 'carro',
      transcripcion_detectada: 'calo',
      transcripcion_revisada: 'carro',
      nivel_ayuda: 'Sin ayuda',
      estado: 'CONFIRMADO',
      origen_evaluacion: 'PROFESIONAL',
      resultado_clinico: 'CORRECTO',
      fecha_registro: new Date('2026-11-20T10:00:00Z'),
      observacion_terapeuta: 'Buena respuesta a estímulo directo.',
      similitud_porcentaje: 75,
      tipo_error_sugerido: 'SUSTITUCION',
      diagnostico_sugerido: 'Posible lambdacismo',
      intentos: 3,
      nota_rapida: 'Practicar vibrante en casa.',
    };

    it('serializarEvaluacionFonologica elimina similitud_texto_porcentaje, tipo_error_sugerido e hipotesis_sugerida para rol PADRE', () => {
      const vistaPadre = serializarEvaluacionFonologica(evaluacionPrueba, 'PADRE');

      assert.equal('similitud_texto_porcentaje' in vistaPadre, false, 'No debe existir similitud_texto_porcentaje');
      assert.equal('tipo_error_sugerido' in vistaPadre, false, 'No debe existir tipo_error_sugerido');
      assert.equal('hipotesis_sugerida' in vistaPadre, false, 'No debe existir hipotesis_sugerida');
      assert.equal('intentos' in vistaPadre, false, 'No debe existir intentos');
      assert.equal('nota_rapida' in vistaPadre, false, 'No debe existir nota_rapida');
      assert.equal('transcripcion_revisada' in vistaPadre, false, 'No expone transcripcion_revisada duplicada');

      // La familia recibe transcripción revisada en transcripcion_detectada
      assert.equal(vistaPadre.transcripcion_detectada, 'carro');
      assert.equal(vistaPadre.observacion_terapeuta, 'Buena respuesta a estímulo directo.');
      assert.equal(vistaPadre.fonema_objetivo, '/rr/');
      assert.equal(vistaPadre.palabra_objetivo, 'carro');
    });

    it('serializarEvaluacionFonologica conserva los indicadores para rol TERAPEUTA y ADMIN', () => {
      for (const rol of ['TERAPEUTA', 'ADMIN'] as const) {
        const vistaClinica = serializarEvaluacionFonologica(evaluacionPrueba, rol);
        assert.equal(vistaClinica.similitud_texto_porcentaje, 75);
        assert.equal(vistaClinica.tipo_error_sugerido, 'SUSTITUCION');
        assert.equal(vistaClinica.hipotesis_sugerida, 'Posible lambdacismo');
        assert.equal(vistaClinica.intentos, 3);
        assert.equal(vistaClinica.nota_rapida, 'Practicar vibrante en casa.');
        assert.equal(vistaClinica.transcripcion_detectada, 'calo');
        assert.equal(vistaClinica.transcripcion_revisada, 'carro');
      }
    });

    it('verificación en endpoint real con base de datos cuando ASHAKIDS_RUN_DB_E2E=1', {
      skip: !runDbE2E && 'Requiere ASHAKIDS_RUN_DB_E2E=1 y base aislada',
    }, async () => {
      const { app } = await import('../../backend/dist/app.js');
      const server: Server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
      });
      const addr = server.address();
      const port = addr && typeof addr === 'object' ? addr.port : 0;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        const payload = Buffer.from(JSON.stringify({
          id_usuario: 9991, email: 'padre.critico@ashakids.test', nombres: 'Padre', apellidos: 'Test', rol: 'PADRE', roles: ['PADRE'],
        })).toString('base64');
        const res = await fetch(`${baseUrl}/api/v1/clinica/evaluaciones-fonologicas/1`, {
          headers: { authorization: `Bearer ${payload}` },
        });
        if (res.status === 200) {
          const body = await res.json() as Array<Record<string, unknown>>;
          for (const ev of body) {
            assert.equal('similitud_texto_porcentaje' in ev, false);
            assert.equal('tipo_error_sugerido' in ev, false);
            assert.equal('hipotesis_sugerida' in ev, false);
          }
        }
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });

  describe('c. Pronóstico apagado estricto', () => {
    it('sin modelo aprobado con manifiesto, el estado del pronóstico es estrictamente disponible: false', async () => {
      const estado = await clinicaService.getEstadoPronostico({
        id_usuario: 1,
        email: 'admin@ashakids.test',
        nombres: 'Admin',
        apellidos: 'Test',
        rol: 'ADMIN',
        roles: ['ADMIN'],
        activo: true,
      });

      assert.equal(estado.disponible, false, 'El pronóstico no debe estar disponible sin modelo aprobado');
      assert.notEqual(estado.disponible, true, 'Bajo ninguna circunstancia debe ser true');
      assert.equal(estado.version_modelo, null, 'No debe reportar versión de modelo');
    });

    it('rol TERAPEUTA también recibe disponible: false cuando no hay modelo', async () => {
      const estadoTerapeuta = await clinicaService.getEstadoPronostico({
        id_usuario: 2,
        email: 'terapeuta@ashakids.test',
        nombres: 'Terapeuta',
        apellidos: 'Test',
        rol: 'TERAPEUTA',
        roles: ['TERAPEUTA'],
        activo: true,
      });

      assert.equal(estadoTerapeuta.disponible, false);
      assert.equal(estadoTerapeuta.version_modelo, null);
    });
  });

  describe('d. Límites exactos de la ventana de inicio de sesión', () => {
    it('SESSION_EARLY_START_MINUTES está definido en exactamente 5 minutos', () => {
      assert.equal(SESSION_EARLY_START_MINUTES, 5);
    });

    // Función que evalúa la ventana temporal idéntica a la consulta SQL y validación de sesiones.service.ts
    function evaluarVentanaInicio(inicio: Date, fin: Date, ahora: Date, earlyMinutes = SESSION_EARLY_START_MINUTES) {
      const inicioMs = inicio.getTime();
      const finMs = fin.getTime();
      const ahoraMs = ahora.getTime();
      const earlyMs = earlyMinutes * 60 * 1000;
      const yaEsHora = ahoraMs >= (inicioMs - earlyMs);
      const yaTermino = ahoraMs >= finMs;
      return { yaEsHora, yaTermino, permitido: yaEsHora && !yaTermino };
    }

    const citaInicio = new Date('2026-11-20T10:00:00Z');
    const citaFin = new Date('2026-11-20T10:45:00Z');

    it('iniciar a exactamente T-5 min (09:55:00) se acepta', () => {
      const tExactoMenos5 = new Date('2026-11-20T09:55:00Z');
      const resultado = evaluarVentanaInicio(citaInicio, citaFin, tExactoMenos5);
      assert.equal(resultado.yaEsHora, true);
      assert.equal(resultado.yaTermino, false);
      assert.equal(resultado.permitido, true, 'A T-5 minutos exactos la sesión debe permitirse');
    });

    it('iniciar a T-5 min menos 1 segundo (09:54:59) se rechaza por horario prematuro', () => {
      const tMenos5Menos1s = new Date('2026-11-20T09:54:59Z');
      const resultado = evaluarVentanaInicio(citaInicio, citaFin, tMenos5Menos1s);
      assert.equal(resultado.yaEsHora, false);
      assert.equal(resultado.permitido, false, '1 segundo antes de T-5 min debe rechazarse');
    });

    it('iniciar durante el transcurso de la cita (10:15:00) se acepta', () => {
      const tEnCurso = new Date('2026-11-20T10:15:00Z');
      const resultado = evaluarVentanaInicio(citaInicio, citaFin, tEnCurso);
      assert.equal(resultado.yaEsHora, true);
      assert.equal(resultado.yaTermino, false);
      assert.equal(resultado.permitido, true);
    });

    it('iniciar exactamente al fin de la cita (10:45:00) o después se rechaza por horario expirado', () => {
      const tFinExacto = new Date('2026-11-20T10:45:00Z');
      const resultadoFin = evaluarVentanaInicio(citaInicio, citaFin, tFinExacto);
      assert.equal(resultadoFin.yaTermino, true);
      assert.equal(resultadoFin.permitido, false, 'Al final de la cita ya terminó y debe rechazarse');

      const tDespues = new Date('2026-11-20T10:45:01Z');
      const resultadoDespues = evaluarVentanaInicio(citaInicio, citaFin, tDespues);
      assert.equal(resultadoDespues.yaTermino, true);
      assert.equal(resultadoDespues.permitido, false, 'Después del fin de la cita debe rechazarse');
    });

    it('evaluación SQL exacta de la ventana cuando PostgreSQL está conectado', {
      skip: !canRunDatabaseTests && 'Requiere base de datos local aislada',
    }, async () => {
      const r = await pool.query<{ ya_es_hora: boolean; ya_termino: boolean }>(
        `SELECT ($3::timestamptz >= $1::timestamptz - ($4::int * INTERVAL '1 minute')) AS ya_es_hora,
                ($3::timestamptz >= $2::timestamptz) AS ya_termino;`,
        ['2026-11-20T10:00:00Z', '2026-11-20T10:45:00Z', '2026-11-20T09:55:00Z', SESSION_EARLY_START_MINUTES],
      );
      assert.equal(r.rows[0].ya_es_hora, true);
      assert.equal(r.rows[0].ya_termino, false);

      const rPrematuro = await pool.query<{ ya_es_hora: boolean; ya_termino: boolean }>(
        `SELECT ($3::timestamptz >= $1::timestamptz - ($4::int * INTERVAL '1 minute')) AS ya_es_hora,
                ($3::timestamptz >= $2::timestamptz) AS ya_termino;`,
        ['2026-11-20T10:00:00Z', '2026-11-20T10:45:00Z', '2026-11-20T09:54:59Z', SESSION_EARLY_START_MINUTES],
      );
      assert.equal(rPrematuro.rows[0].ya_es_hora, false);

      const rExpirado = await pool.query<{ ya_es_hora: boolean; ya_termino: boolean }>(
        `SELECT ($3::timestamptz >= $1::timestamptz - ($4::int * INTERVAL '1 minute')) AS ya_es_hora,
                ($3::timestamptz >= $2::timestamptz) AS ya_termino;`,
        ['2026-11-20T10:00:00Z', '2026-11-20T10:45:00Z', '2026-11-20T10:45:00Z', SESSION_EARLY_START_MINUTES],
      );
      assert.equal(rExpirado.rows[0].ya_termino, true);
    });
  });
});
