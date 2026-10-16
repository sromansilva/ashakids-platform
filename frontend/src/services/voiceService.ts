import { apiClient } from '@/api/client';
import type { GameProgress } from './learningGames';

export type EstadoTranscripcion = 'OK' | 'AUDIO_VACIO' | 'AUDIO_CORTO' | 'ERROR';

export interface DetallePalabra {
  palabra: string;
  estado: 'correcta' | 'omitida' | 'adicional';
}

export interface ComparacionResultado {
  frase_esperada: string;
  frase_obtenida: string;
  porcentaje_coincidencia: number;
  palabras_esperadas: string[];
  palabras_obtenidas: string[];
  palabras_omitidas: string[];
  palabras_adicionales: string[];
  es_coincidente: boolean;
  desglose: DetallePalabra[];
  aviso: string;
}

export interface TranscripcionRespuesta {
  estado: EstadoTranscripcion;
  transcripcion: string;
  duracion_audio_segundos?: number;
  tiempo_procesamiento_segundos?: number;
  idioma_detectado?: string;
  comparacion?: ComparacionResultado;
  mensaje?: string;
  guardado?: boolean;
  id_intento?: number;
  experiencia_otorgada?: number;
  resumen?: GameProgress;
}

export interface TranscribeOptions {
  targetPhrase?: string;
  patientId?: number;
  level?: number;
  claveIntento?: string;
  duracionSegundos?: number;
  ayudasUsadas?: number;
}

export const voiceService = {
  transcribe: async (
    audioBlob: Blob,
    options?: string | TranscribeOptions
  ): Promise<TranscripcionRespuesta> => {
    const form = new FormData();
    const ext = audioBlob.type.includes('wav') ? 'wav' : 'webm';
    form.append('audio', audioBlob, `audio-grabacion.${ext}`);

    let targetPhrase: string | undefined;
    let patientId: number | undefined;
    let level: number | undefined;
    let claveIntento: string | undefined;
    let duracionSegundos: number | undefined;
    let ayudasUsadas: number | undefined;

    if (typeof options === 'string') {
      targetPhrase = options;
    } else if (options) {
      targetPhrase = options.targetPhrase;
      patientId = options.patientId;
      level = options.level;
      claveIntento = options.claveIntento;
      duracionSegundos = options.duracionSegundos;
      ayudasUsadas = options.ayudasUsadas;
    }

    if (targetPhrase) form.append('frase_esperada', targetPhrase);
    if (patientId !== undefined) form.append('id_paciente', String(patientId));
    if (level !== undefined) form.append('nivel', String(level));
    if (claveIntento) form.append('clave_intento', claveIntento);
    if (duracionSegundos !== undefined) form.append('duracion_segundos', String(duracionSegundos));
    if (ayudasUsadas !== undefined) form.append('ayudas_usadas', String(ayudasUsadas));

    return apiClient.upload<TranscripcionRespuesta>('/educacion/voz/transcribir', form);
  },
};

