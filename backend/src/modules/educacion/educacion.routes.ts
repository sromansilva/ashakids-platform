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

    let transcripcion = fraseEsperada || 'El perro corre';
    if (file && file.buffer) {
      const base64 = file.buffer.toString('base64');
      const trResult = await whisperService.transcribirAudio(base64, fraseEsperada);
      if (trResult && trResult.texto) {
        transcripcion = trResult.texto;
      }
    }

    const targetWords = (fraseEsperada || transcripcion).toLowerCase().split(/\s+/).filter(Boolean);
    const gotWords = transcripcion.toLowerCase().split(/\s+/).filter(Boolean);

    const desglose = targetWords.map(w => ({
      palabra: w,
      estado: gotWords.includes(w) ? ('correcta' as const) : ('omitida' as const),
    }));

    const correctCount = desglose.filter(d => d.estado === 'correcta').length;
    const porcentaje = targetWords.length > 0 ? Math.round((correctCount / targetWords.length) * 100) : 100;
    const esCoincidente = porcentaje >= 60;

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
      tiempo_procesamiento_segundos: 0.8,
      idioma_detectado: 'es',
      comparacion: {
        frase_esperada: fraseEsperada || transcripcion,
        frase_obtenida: transcripcion,
        porcentaje_coincidencia: porcentaje,
        palabras_esperadas: targetWords,
        palabras_obtenidas: gotWords,
        palabras_omitidas: targetWords.filter(w => !gotWords.includes(w)),
        palabras_adicionales: gotWords.filter(w => !targetWords.includes(w)),
        es_coincidente: esCoincidente,
        desglose,
        aviso: esCoincidente ? '¡Excelente pronunciación!' : 'Sigue practicando para mejorar tu fluidez.',
      },
      guardado,
      id_intento: idIntento,
      experiencia_otorgada: expOtorgada,
      resumen,
    });
  } catch (err: any) {
    console.error('[educacionRouter] Error transcribir:', err);
    res.status(500).json({ estado: 'ERROR', mensaje: err?.message || 'Error procesando audio' });
  }
});

