import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import type { EnviarMensajeDTO, CrearIncidenciaDTO } from '../dtos/comunicacion.dto.js';
import { conversacionesService } from '../../conversaciones/conversaciones.service.js';

export class ComunicacionService {
  async getMensajes(user: AuthenticatedUser, conUsuarioId?: number) {
    return conversacionesService.getMensajesLegacy(user, conUsuarioId);
  }

  async enviarMensaje(user: AuthenticatedUser, dto: EnviarMensajeDTO) {
    if (dto.adjunto_url) {
      throw Object.assign(new Error('Los adjuntos deben enviarse desde la conversación.'), { status: 400 });
    }
    return conversacionesService.enviarLegacy(user, dto.destinatario_id, dto.contenido);
  }

  async getNotificaciones(usuarioId: number) {
    return [
      {
        id_notificacion: 1,
        usuario_id: usuarioId,
        tipo: 'RECORDATORIO',
        titulo: 'Próxima sesión',
        mensaje: 'Tiene una sesión agendada para mañana a las 10:00.',
        leida: false,
        creada_en: new Date().toISOString(),
      },
    ];
  }

  async crearIncidencia(usuarioId: number, dto: CrearIncidenciaDTO) {
    return {
      id_incidencia: Date.now(),
      usuario_id: usuarioId,
      ...dto,
      estado: 'ABIERTA',
      creada_en: new Date().toISOString(),
    };
  }
}

export const comunicacionService = new ComunicacionService();

