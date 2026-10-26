import { pool } from '../../../core/database.js';
import type { ProgresoJuegoDTO, ReconocimientoVozDTO } from '../dtos/mundo_asha.dto.js';
import { whisperService } from './whisper.service.js';

export class MundoAshaService {
  async guardarProgreso(dto: ProgresoJuegoDTO) {
    try {
      const estrellas = dto.errores === 0 ? 3 : dto.errores <= 2 ? 2 : 1;
      const res = await pool.query(
        `INSERT INTO resultados_nivel (id_paciente, id_nivel, estrellas_obtenidas, errores_cometidos, tiempo_segundos, fecha_completado)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id_resultado;`,
        [dto.id_paciente, dto.nivel, estrellas, dto.errores, dto.duracion_segundos]
      );
      return {
        id_registro: res.rows[0]?.id_resultado || Date.now(),
        ...dto,
        estrellas,
        guardado_en: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[MundoAshaService] Fallback guardarProgreso:', err);
      return {
        id_registro: Date.now(),
        ...dto,
        estrellas: dto.errores === 0 ? 3 : dto.errores <= 2 ? 2 : 1,
        guardado_en: new Date().toISOString(),
      };
    }
  }

  async reconocerVoz(dto: ReconocimientoVozDTO) {
    return whisperService.evaluarPronunciacion(dto.audio_base64, dto.palabra_objetivo);
  }

  async getCatalogoMundos() {
    try {
      const res = await pool.query(`SELECT id_mundo, nombre_mundo, descripcion, objetivo, activo FROM mundos WHERE activo = true ORDER BY id_mundo ASC;`);
      if (res.rows.length > 0) {
        return res.rows.map(m => ({
          id: `mundo-${m.id_mundo}`,
          id_mundo: m.id_mundo,
          nombre: m.nombre_mundo,
          descripcion: m.descripcion,
          objetivo: m.objetivo,
          mundos_disponibles: 4,
          activo: m.activo,
        }));
      }
    } catch (err) {
      console.warn('[MundoAshaService] Fallback getCatalogoMundos:', err);
    }

    return [
      { id: 'mundo-sonidos', nombre: 'Mundo Sonidos', mundos_disponibles: 4, activo: true },
      { id: 'mundo-palabras', nombre: 'Mundo Palabras', mundos_disponibles: 4, activo: true },
      { id: 'mundo-frases', nombre: 'Mundo Frases', mundos_disponibles: 3, activo: true },
    ];
  }
}

export const mundoAshaService = new MundoAshaService();
