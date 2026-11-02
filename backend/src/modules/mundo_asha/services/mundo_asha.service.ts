import type { ProgresoJuegoDTO, ReconocimientoVozDTO } from '../dtos/mundo_asha.dto.js';
import { whisperService } from './whisper.service.js';
import { juegosService } from '../../juegos/juegos.service.js';

export class MundoAshaService {
  async guardarProgreso(dto: ProgresoJuegoDTO) {
    return juegosService.registrarIntento(dto.id_paciente, dto.mundo, {
      clave_intento: dto.clave_intento,
      version: 'basica-1',
      nivel: dto.nivel,
      respuestas: dto.respuestas,
      duracion_segundos: dto.duracion_segundos,
      ayudas_usadas: dto.ayudas_usadas,
    });
  }

  async reconocerVoz(dto: ReconocimientoVozDTO) {
    return whisperService.evaluarPronunciacion(dto.audio_base64, dto.palabra_objetivo);
  }

  async getCatalogoMundos() {
    return juegosService.getCatalogoPublico();
  }
}

export const mundoAshaService = new MundoAshaService();
