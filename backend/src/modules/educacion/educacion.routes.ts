import { Router, Request, Response } from 'express';
import multer from 'multer';
import { whisperService } from '../mundo_asha/services/whisper.service.js';
import { juegosService, MUNDOS_CATALOGO } from '../juegos/juegos.service.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const educacionRouter = Router();

educacionRouter.post('/voz/transcribir', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    let fraseEsperada = req.body.frase_esperada as string | undefined;
    const idPaciente = req.body.id_paciente ? parseInt(req.body.id_paciente, 10) : undefined;
    const nivel = req.body.nivel ? parseInt(req.body.nivel, 10) : undefined;
    const claveIntento = req.body.clave_intento;
    const duracionSegundos = req.body.duracion_segundos ? parseInt(req.body.duracion_segundos, 10) : 5;
    const ayudasUsadas = req.body.ayudas_usadas ? parseInt(req.body.ayudas_usadas, 10) : 0;

    if (nivel && nivel >= 1 && nivel <= (MUNDOS_CATALOGO['VOZ']?.levels?.length || 5)) {
      const lvl = MUNDOS_CATALOGO['VOZ'].levels[nivel - 1];
      fraseEsperada = Array.isArray(lvl.answer) ? lvl.answer[0] : lvl.answer;
    }

    if (!file?.buffer?.length) {
      res.status(400).json({ estado: 'AUDIO_VACIO', mensaje: 'Selecciona o graba un audio antes de continuar.' });
      return;
    }

    const startedAt = Date.now();
    const { texto: transcripcion } = await whisperService.transcribirAudio(file.buffer.toString('base64'));
    if (!transcripcion.trim()) {
      res.status(422).json({ estado: 'ERROR', mensaje: 'El servicio no pudo obtener una transcripción.' });
      return;
    }

    const normalize = (word: string) => word.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const targetWords = (fraseEsperada || '').toLowerCase().split(/\s+/).filter(Boolean);
    const gotWords = transcripcion.toLowerCase().split(/\s+/).filter(Boolean);
    const normalizedGotWords = gotWords.map(normalize);

    const desglose = targetWords.map(w => ({
      palabra: w,
      estado: normalizedGotWords.includes(normalize(w)) ? ('correcta' as const) : ('omitida' as const),
    }));

    const esCoincidente = targetWords.length > 0 && desglose.every(d => d.estado === 'correcta');

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
        palabras_omitidas: targetWords.filter(w => !normalizedGotWords.includes(normalize(w))),
        palabras_adicionales: gotWords.filter(w => !targetWords.includes(w)),
        es_coincidente: esCoincidente,
        desglose,
        aviso: 'La comparación usa el texto reconocido para la actividad y no evalúa la pronunciación.',
      } } : {}),
      guardado,
      id_intento: idIntento,
      experiencia_otorgada: expOtorgada,
      resumen,
    });
  } catch (err: any) {
    console.error('[educacionRouter] Error transcribir:', err);
    const unavailable = err?.name === 'TranscriptionUnavailableError';
    res.status(unavailable ? 503 : 500).json({ estado: 'ERROR', mensaje: unavailable ? 'El servicio de transcripción no está disponible. Puedes volver a intentarlo.' : err?.message || 'Error procesando audio' });
  }
});

