import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import { incidenciasService } from '../../incidencias/incidencias.service.js';
import { soporteRepository } from '../infrastructure/soporte.repository.js';
import { notasRepository } from '../../incidencias/infrastructure/notas.repository.js';
import type { EstadoSoporte, FiltrosSoporte } from '../domain/soporte.js';

const notFound = () => Object.assign(new Error('Incidencia técnica no encontrada.'), { status: 404 });
export const soporteService = {
  listar: (filters: FiltrosSoporte) => soporteRepository.listar(filters),
  async obtener(id: number) {
    const ticket = await soporteRepository.obtener(id);
    if (!ticket) throw notFound();
    return ticket;
  },
  async crear(user: AuthenticatedUser, body: { tipo: string; descripcion: string; envio_id?: string; area_destino?: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO'; id_terapeuta?: number | null }) {
    // Classification, priority and initial state remain owned by the incident workflow.
    const ticket = await incidenciasService.crear(user.id_usuario, 'SOPORTE_TECNICO', 'Soporte Técnico', {
      ...body, envio_id: body.envio_id ?? randomUUID(),
    });
    return this.obtener(ticket.id_incidencia);
  },
  async estado(id: number, estado: EstadoSoporte) {
    const ticket = await soporteRepository.estado(id, estado);
    if (!ticket) throw notFound();
    return ticket;
  },
  async notas(id: number) {
    await this.obtener(id);
    return notasRepository.listar(id, true);
  },
  async responder(id: number, user: AuthenticatedUser, body: { contenido: string; interna: boolean }) {
    await this.obtener(id);
    return notasRepository.agregar(id, user.id_usuario, body.contenido, body.interna);
  },
};
