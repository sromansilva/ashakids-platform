import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceSpeechGame } from '@/modules/padre/presentation/Sessions/VoiceSpeechGame';
import { voiceService, type TranscripcionRespuesta } from '@/modules/mundo_asha/infrastructure/voiceService';

// Mock de MediaStreamTrack y MediaStream
class MockMediaStreamTrack {
  stop = vi.fn();
}

class MockMediaStream {
  tracks: MockMediaStreamTrack[];
  constructor() {
    this.tracks = [new MockMediaStreamTrack()];
  }
  getTracks() {
    return this.tracks;
  }
}

// Mock de MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true);
  state = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      // Emitir un blob simulado con tamaño suficiente
      this.ondataavailable({ data: new Blob(['x'.repeat(1024)], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }
}

describe('VoiceSpeechGame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Inyectar mocks globales
    (window as unknown as { MediaRecorder: typeof MockMediaRecorder }).MediaRecorder = MockMediaRecorder;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza la frase objetivo y el estado inicial "ready"', () => {
    render(<VoiceSpeechGame targetPhrase="El gato duerme" />);
    expect(screen.getByTestId('target-phrase')).toHaveTextContent('«El gato duerme»');
    expect(screen.getByTestId('record-btn')).toBeInTheDocument();
    expect(screen.getByText(/Escuchar frase modelo/i)).toBeInTheDocument();
    expect(screen.getByText(/no constituye un diagnóstico/i)).toBeInTheDocument();
  });

  it('gestiona cuando el acceso al micrófono es denegado (estado blocked)', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(error);

    render(<VoiceSpeechGame targetPhrase="El gato duerme" />);
    fireEvent.click(screen.getByTestId('record-btn'));

    await waitFor(() => {
      expect(screen.getByText(/Micrófono no disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/Permiso de micrófono denegado/i)).toBeInTheDocument();
    });
  });

  it('inicia grabación, detiene y muestra la transcripción recibida', async () => {
    const mockRespuesta: TranscripcionRespuesta = {
      estado: 'OK',
      transcripcion: 'el gato duerme',
      duracion_audio_segundos: 2.1,
      tiempo_procesamiento_segundos: 0.8,
      idioma_detectado: 'es',
      comparacion: {
        frase_esperada: 'El gato duerme',
        frase_obtenida: 'el gato duerme',
        porcentaje_coincidencia: 100.0,
        palabras_esperadas: ['el', 'gato', 'duerme'],
        palabras_obtenidas: ['el', 'gato', 'duerme'],
        palabras_omitidas: [],
        palabras_adicionales: [],
        es_coincidente: true,
        desglose: [
          { palabra: 'el', estado: 'correcta' },
          { palabra: 'gato', estado: 'correcta' },
          { palabra: 'duerme', estado: 'correcta' },
        ],
        aviso: 'Herramienta lúdica.',
      },
    };

    vi.spyOn(voiceService, 'transcribe').mockResolvedValue(mockRespuesta);

    render(<VoiceSpeechGame targetPhrase="El gato duerme" />);

    // Iniciar grabación
    fireEvent.click(screen.getByTestId('record-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('stop-btn')).toBeInTheDocument();
      expect(screen.getByText(/Grabando tu voz/i)).toBeInTheDocument();
    });

    // Detener grabación
    fireEvent.click(screen.getByTestId('stop-btn'));

    // Debe mostrar la transcripción y feedback
    await waitFor(() => {
      expect(screen.getByTestId('transcription-result')).toBeInTheDocument();
      expect(screen.getByTestId('transcribed-text')).toHaveTextContent('«el gato duerme»');
      expect(screen.getByText(/¡Excelente pronunciación!/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
  });

  it('muestra retroalimentación cuando hay palabras omitidas y permite reintentar', async () => {
    const mockRespuesta: TranscripcionRespuesta = {
      estado: 'OK',
      transcripcion: 'el gato',
      duracion_audio_segundos: 1.5,
      tiempo_procesamiento_segundos: 0.5,
      comparacion: {
        frase_esperada: 'El gato duerme',
        frase_obtenida: 'el gato',
        porcentaje_coincidencia: 80.0,
        palabras_esperadas: ['el', 'gato', 'duerme'],
        palabras_obtenidas: ['el', 'gato'],
        palabras_omitidas: ['duerme'],
        palabras_adicionales: [],
        es_coincidente: false,
        desglose: [
          { palabra: 'el', estado: 'correcta' },
          { palabra: 'gato', estado: 'correcta' },
          { palabra: 'duerme', estado: 'omitida' },
        ],
        aviso: 'Lúdico',
      },
    };

    vi.spyOn(voiceService, 'transcribe').mockResolvedValue(mockRespuesta);

    render(<VoiceSpeechGame targetPhrase="El gato duerme" />);
    fireEvent.click(screen.getByTestId('record-btn'));

    await waitFor(() => expect(screen.getByTestId('stop-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('stop-btn'));

    await waitFor(() => {
      expect(screen.getByText(/¡Buen intento! Estuviste muy cerca/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
    });

    // Clic en reintentar
    fireEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));
    expect(screen.getByTestId('record-btn')).toBeInTheDocument();
  });

  it('muestra estado vacío si el backend reporta AUDIO_VACIO', async () => {
    const mockVacio: TranscripcionRespuesta = {
      estado: 'AUDIO_VACIO',
      transcripcion: '',
      mensaje: 'No se detectaron palabras en la grabación.',
    };

    vi.spyOn(voiceService, 'transcribe').mockResolvedValue(mockVacio);

    render(<VoiceSpeechGame targetPhrase="El gato duerme" />);
    fireEvent.click(screen.getByTestId('record-btn'));

    await waitFor(() => expect(screen.getByTestId('stop-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('stop-btn'));

    await waitFor(() => {
      expect(screen.getByText(/No pudimos escuchar tu voz/i)).toBeInTheDocument();
    });
  });

  it('persiste el intento con patientId y ejecuta onSaved al recibir guardado=true con resumen', async () => {
    const onSavedMock = vi.fn();
    const mockResumen = {
      id_paciente: 102,
      version: 'basica-1',
      experiencia: 100,
      nivel: 1,
      mundos: [],
      medallas: [],
      intentos_totales: 1,
      experiencia_siguiente_nivel: 200,
    };

    const mockRespuesta: TranscripcionRespuesta = {
      estado: 'OK',
      transcripcion: 'el gato duerme sobre la cama',
      guardado: true,
      id_intento: 42,
      experiencia_otorgada: 100,
      resumen: mockResumen,
      comparacion: {
        frase_esperada: 'El gato duerme sobre la cama',
        frase_obtenida: 'el gato duerme sobre la cama',
        porcentaje_coincidencia: 100.0,
        palabras_esperadas: ['el', 'gato', 'duerme', 'sobre', 'la', 'cama'],
        palabras_obtenidas: ['el', 'gato', 'duerme', 'sobre', 'la', 'cama'],
        palabras_omitidas: [],
        palabras_adicionales: [],
        es_coincidente: true,
        desglose: [
          { palabra: 'el', estado: 'correcta' },
          { palabra: 'gato', estado: 'correcta' },
          { palabra: 'duerme', estado: 'correcta' },
          { palabra: 'sobre', estado: 'correcta' },
          { palabra: 'la', estado: 'correcta' },
          { palabra: 'cama', estado: 'correcta' },
        ],
        aviso: 'Lúdico',
      },
    };

    const transcribeSpy = vi.spyOn(voiceService, 'transcribe').mockResolvedValue(mockRespuesta);

    render(
      <VoiceSpeechGame
        levelNumber={2}
        targetPhrase="El gato duerme sobre la cama"
        patientId={102}
        onSaved={onSavedMock}
      />
    );

    expect(screen.getByText(/Nivel 2 · El Estudio de la Voz/i)).toBeInTheDocument();

    // Iniciar y detener grabación
    fireEvent.click(screen.getByTestId('record-btn'));
    await waitFor(() => expect(screen.getByTestId('stop-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('stop-btn'));

    await waitFor(() => {
      expect(screen.getByText(/Intento guardado en tu progreso/i)).toBeInTheDocument();
      expect(screen.getByText(/\+100 XP/i)).toBeInTheDocument();
    });

    expect(onSavedMock).toHaveBeenCalledWith(mockResumen);
    expect(transcribeSpy).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.objectContaining({
        targetPhrase: 'El gato duerme sobre la cama',
        patientId: 102,
        level: 2,
        claveIntento: expect.any(String),
      })
    );
  });
});
