import { Router, Request, Response } from 'express';
import multer from 'multer';
import { speechTranscriptionService } from '../mundo_asha/services/speech-transcription.service.js';
import { juegosService, MUNDOS_CATALOGO } from '../juegos/juegos.service.js';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';
import { assertPatientOwner, assertPatientAccess, assertConsentAccess } from '../../core/security/clinical-access.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const educacionRouter = Router();
educacionRouter.use(authenticate);

educacionRouter.post('/voz/transcribir', requireRoles(['ADMIN', 'PADRE']), upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    let fraseEsperada = req.body.frase_esperada as string | undefined;
    const idPaciente = req.body.id_paciente ? parseInt(req.body.id_paciente, 10) : undefined;
    const nivel = req.body.nivel ? parseInt(req.body.nivel, 10) : undefined;
    const claveIntento = req.body.clave_intento;
    const duracionSegundos = req.body.duracion_segundos ? parseInt(req.body.duracion_segundos, 10) : 5;
    const ayudasUsadas = req.body.ayudas_usadas ? parseInt(req.body.ayudas_usadas, 10) : 0;

    if (!Number.isInteger(idPaciente) || idPaciente! <= 0) {
      res.status(400).json({ estado: 'ERROR', mensaje: 'Selecciona un paciente de tu familia.' });
      return;
    }
    if (req.user!.rol === 'PADRE') await assertPatientOwner(req.user!, idPaciente!);
    else await assertPatientAccess(req.user!, idPaciente!);
    await assertConsentAccess(idPaciente!);
    if (!Number.isInteger(duracionSegundos) || duracionSegundos < 0 || duracionSegundos > 3600 ||
        !Number.isInteger(ayudasUsadas) || ayudasUsadas < 0 || ayudasUsadas > 100) {
      res.status(400).json({ estado: 'ERROR', mensaje: 'La duración o el número de ayudas no son válidos.' });
      return;
    }
    if (nivel !== undefined && (!Number.isInteger(nivel) || nivel < 1 || nivel > 5)) {
      res.status(400).json({ estado: 'ERROR', mensaje: 'El nivel indicado no es válido.' });
      return;
    }
    if ((nivel !== undefined && !claveIntento) ||
        (claveIntento && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(claveIntento))) {
      res.status(400).json({ estado: 'ERROR', mensaje: 'Falta la clave única del intento.' });
      return;
    }
    if (nivel && nivel >= 1 && nivel <= (MUNDOS_CATALOGO['VOZ']?.levels?.length || 5)) {
      const lvl = MUNDOS_CATALOGO['VOZ'].levels[nivel - 1];
      fraseEsperada = Array.isArray(lvl.answer) ? lvl.answer[0] : lvl.answer;
    }

    if (!file?.buffer?.length) {
      res.status(400).json({ estado: 'AUDIO_VACIO', mensaje: 'Selecciona o graba un audio antes de continuar.' });
      return;
    }
    if (!['audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mp4', 'audio/mpeg', 'audio/flac'].includes(file.mimetype)) {
      res.status(415).json({ estado: 'ERROR', mensaje: 'El formato de audio no es compatible.' });
      return;
    }

    const startedAt = Date.now();
    const { texto: transcripcion } = await speechTranscriptionService.transcribirAudio(file.buffer, file.mimetype || 'audio/webm');
    if (!transcripcion.trim()) {
      res.status(422).json({ estado: 'ERROR', mensaje: 'El servicio no pudo obtener una transcripción.' });
      return;
    }

    const normalizePhrase = (phrase: string) => phrase.toLocaleLowerCase('es').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const targetWords = (fraseEsperada || '').trim().split(/\s+/).filter(Boolean);
    const gotWords = transcripcion.trim().split(/\s+/).filter(Boolean);
    const normalizedTargetWords = normalizePhrase(fraseEsperada || '').split(' ').filter(Boolean);
    const normalizedGotWords = normalizePhrase(transcripcion).split(' ').filter(Boolean);
    const wordCount = Math.max(targetWords.length, gotWords.length);

    const desglose = targetWords.map((word, index) => ({
      palabra: word,
      estado: normalizedTargetWords[index] && normalizedTargetWords[index] === normalizedGotWords[index]
        ? ('correcta' as const)
        : ('omitida' as const),
    }));

    const esCoincidente = normalizedTargetWords.length > 0 &&
      JSON.stringify(normalizedTargetWords) === JSON.stringify(normalizedGotWords);
    const palabrasOmitidas = targetWords.filter((_, index) => normalizedTargetWords[index] !== normalizedGotWords[index]);
    const palabrasAdicionales = gotWords.filter((_, index) => normalizedGotWords[index] !== normalizedTargetWords[index]);

    let guardado = false;
    let idIntento: number | undefined;
    let expOtorgada: number | undefined;
    let resumen: any;

    if (idPaciente && nivel && claveIntento) {
      const intentoResult = await juegosService.registrarIntento(idPaciente, 'VOZ', {
        clave_intento: claveIntento,
        version: 'basica-1',
        nivel,
        respuestas: [transcripcion],
        duracion_segundos: duracionSegundos,
        ayudas_usadas: ayudasUsadas,
      });
      guardado = true;
      idIntento = intentoResult.id_intento;
      expOtorgada = intentoResult.experiencia_otorgada;
      resumen = intentoResult.resumen;
    }

    res.json({
      estado: 'OK',
      transcripcion,
      duracion_audio_segundos: duracionSegundos,
      tiempo_procesamiento_segundos: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
      ...(fraseEsperada ? { comparacion: {
        frase_esperada: fraseEsperada,
        frase_obtenida: transcripcion,
        palabras_esperadas: targetWords,
        palabras_obtenidas: gotWords,
        palabras_omitidas: palabrasOmitidas,
        palabras_adicionales: palabrasAdicionales,
        es_coincidente: esCoincidente,
        desglose: desglose.slice(0, wordCount),
        aviso: 'La comparación usa el texto reconocido para la actividad y no evalúa la pronunciación.',
      } } : {}),
      guardado,
      id_intento: idIntento,
      experiencia_otorgada: expOtorgada,
      resumen,
    });
  } catch (err: any) {
    const unavailable = err?.name === 'TranscriptionUnavailableError';
    const status = unavailable ? 503 : Number.isInteger(err?.status) ? err.status : 500;
    res.status(status).json({ estado: 'ERROR', mensaje: unavailable ? 'El servicio de transcripción no está disponible. Puedes volver a intentarlo.' : status < 500 ? err.message : 'No se pudo procesar el audio.' });
  } finally {
    req.file?.buffer.fill(0);
  }
});

