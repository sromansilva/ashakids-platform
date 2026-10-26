import type { EnviarMensajeDTO, CrearIncidenciaDTO } from '../dtos/comunicacion.dto.js';

export class ComunicacionService {
  async getMensajes(usuarioId: number, conUsuarioId?: number) {
    return [
      {
        id_mensaje: 1,
        remitente_id: conUsuarioId || 2,
        destinatario_id: usuarioId,
        contenido: 'Hola, recuerde repasar la actividad de discriminación auditiva hoy.',
        leido: true,
        creado_en: '2026-10-24T18:00:00Z',
      },
    ];
  }

  async enviarMensaje(remitenteId: number, dto: EnviarMensajeDTO) {
    return {
      id_mensaje: Date.now(),
      remitente_id: remitenteId,
      ...dto,
      leido: false,
      creado_en: new Date().toISOString(),
    };
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

