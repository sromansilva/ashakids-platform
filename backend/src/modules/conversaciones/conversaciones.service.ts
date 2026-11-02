import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { AuthenticatedUser } from '../../core/middleware/auth.middleware.js';
import { pool } from '../../core/database.js';
import { getTherapistId } from '../../core/security/clinical-access.js';

export interface ContactItem {
  id_tutor: number;
  id_terapeuta: number;
  tutor_nombre: string;
  terapeuta_nombre: string;
}

export interface ConversationItem extends ContactItem {
  id_conversacion: number;
  estado: string;
  ultima_actividad: string;
  puede_enviar: boolean;
  id_usuario_tutor: number;
  id_usuario_terapeuta: number;
}

export interface AttachmentItem {
  id_adjunto: number;
  nombre_archivo: string;
  mime_type: string;
  tamano_bytes: number;
  duracion_segundos: number | null;
}

export interface MessageItem {
  id_mensaje: number;
  id_conversacion: number;
  id_usuario_emisor: number | null;
  texto_mensaje: string | null;
  fecha_envio: string;
  adjuntos: AttachmentItem[];
}

export interface UploadedAttachment {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface DownloadableAttachment extends AttachmentItem {
  contenido: Buffer;
}

interface LegacyMessageItem {
  id_mensaje: number;
  id_conversacion: number;
  remitente_id: number | null;
  destinatario_id: number;
  contenido: string | null;
  leido: boolean;
  creado_en: string;
}

const activeLinksSql = [
  `SELECT p.id_tutor, r.id_terapeuta
   FROM pacientes p
   JOIN reservas r ON r.id_paciente = p.id_paciente
   WHERE UPPER(COALESCE(r.estado_reserva, '')) <> 'CANCELADA'`,
  `SELECT p.id_tutor, tr.id_terapeuta
   FROM pacientes p
   JOIN expedientes e ON e.id_paciente = p.id_paciente
   JOIN tratamientos tr ON tr.id_expediente = e.id_expediente
   WHERE UPPER(COALESCE(tr.estado_tratamiento, '')) = 'ACTIVO'`,
].join('\nUNION\n');

const readableLinksSql = [
  activeLinksSql,
  `SELECT p.id_tutor, r.id_terapeuta
   FROM pacientes p
   JOIN reservas r ON r.id_paciente = p.id_paciente
   JOIN sesiones s ON s.id_reserva = r.id_reserva`,
].join('\nUNION\n');

const supportedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'text/plain',
]);

function fail(message: string, status = 404): Error {
  return Object.assign(new Error(message), { status });
}

function requireMessagingRole(user: AuthenticatedUser): void {
  if (!user || !Number.isSafeInteger(user.id_usuario) || user.id_usuario <= 0) {
    throw fail('Acceso no autorizado.', 401);
  }
  if (user.rol !== 'PADRE' && user.rol !== 'TERAPEUTA') {
    throw fail('Permisos insuficientes para este recurso.', 403);
  }
}

function parsePositiveId(value: unknown, label: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw fail(label + ' no encontrado.', 404);
  return id;
}

function clampLimit(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(100, Math.trunc(value)));
}

function mapContact(row: Record<string, unknown>): ContactItem {
  return {
    id_tutor: Number(row.id_tutor),
    id_terapeuta: Number(row.id_terapeuta),
    tutor_nombre: String(row.tutor_nombre ?? '').trim() || 'Tutor Registrado',
    terapeuta_nombre: String(row.terapeuta_nombre ?? '').trim() || 'Terapeuta Especialista',
  };
}

function mapConversation(row: Record<string, unknown>): ConversationItem {
  return {
    ...mapContact(row),
    id_conversacion: Number(row.id_conversacion),
    estado: String(row.estado ?? 'ACTIVA'),
    ultima_actividad: new Date(String(row.ultima_actividad)).toISOString(),
    puede_enviar: Boolean(row.puede_enviar),
    id_usuario_tutor: Number(row.id_usuario_tutor),
    id_usuario_terapeuta: Number(row.id_usuario_terapeuta),
  };
}

function mapAttachment(row: Record<string, unknown>): AttachmentItem {
  return {
    id_adjunto: Number(row.id_adjunto),
    nombre_archivo: String(row.nombre_archivo),
    mime_type: String(row.mime_type),
    tamano_bytes: Number(row.tamano_bytes),
    duracion_segundos: row.duracion_segundos == null ? null : Number(row.duracion_segundos),
  };
}

function mapMessage(row: Record<string, unknown>, attachments: AttachmentItem[] = []): MessageItem {
  return {
    id_mensaje: Number(row.id_mensaje),
    id_conversacion: Number(row.id_conversacion),
    id_usuario_emisor: row.id_usuario_emisor == null ? null : Number(row.id_usuario_emisor),
    texto_mensaje: row.texto_mensaje == null ? null : String(row.texto_mensaje),
    fecha_envio: new Date(String(row.fecha_envio)).toISOString(),
    adjuntos: attachments,
  };
}

function actorColumn(user: AuthenticatedUser, tutorAlias: string, therapistAlias: string): string {
  requireMessagingRole(user);
  return user.rol === 'PADRE' ? tutorAlias + '.id_usuario' : therapistAlias + '.id_usuario';
}

function mapLegacyMessage(row: Record<string, unknown>, userId: number): LegacyMessageItem {
  const sender = row.id_usuario_emisor == null ? null : Number(row.id_usuario_emisor);
  const tutorUserId = Number(row.id_usuario_tutor);
  const therapistUserId = Number(row.id_usuario_terapeuta);
  const recipient = sender === tutorUserId ? therapistUserId : tutorUserId;
  return {
    id_mensaje: Number(row.id_mensaje),
    id_conversacion: Number(row.id_conversacion),
    remitente_id: sender,
    destinatario_id: sender === userId ? recipient : userId,
    contenido: row.texto_mensaje == null ? null : String(row.texto_mensaje),
    leido: Boolean(row.leido),
    creado_en: new Date(String(row.fecha_envio)).toISOString(),
  };
}

export class ConversacionesService {
  private async getTutorId(userId: number): Promise<number> {
    const result = await pool.query(
      'SELECT id_tutor FROM tutores WHERE id_usuario = $1 LIMIT 1;',
      [userId],
    );
    if (!result.rows[0]) throw fail('Perfil de familia no encontrado.');
    return Number(result.rows[0].id_tutor);
  }

  private async getCurrentTherapistId(userId: number): Promise<number> {
    const therapistId = await getTherapistId(userId);
    if (!therapistId) throw fail('Perfil de terapeuta no encontrado.');
    return therapistId;
  }

  async getContactos(user: AuthenticatedUser): Promise<{ items: ContactItem[]; total: number }> {
    requireMessagingRole(user);
    const actor = user.rol === 'PADRE' ? 'tut.id_usuario' : 'ter.id_usuario';
    const result = await pool.query(
      'SELECT DISTINCT tut.id_tutor, ter.id_terapeuta, ' +
        `CONCAT(ut.nombres, ' ', COALESCE(ut.apellidos, '')) AS tutor_nombre, ` +
        `CONCAT(ue.nombres, ' ', COALESCE(ue.apellidos, '')) AS terapeuta_nombre ` +
        'FROM (' + activeLinksSql + ') link ' +
        'JOIN tutores tut ON tut.id_tutor = link.id_tutor ' +
        'JOIN usuarios ut ON ut.id_usuario = tut.id_usuario ' +
        'JOIN usuario_roles tutor_role ON tutor_role.id_usuario = ut.id_usuario AND tutor_role.activo = true ' +
        "JOIN roles tutor_role_name ON tutor_role_name.id_rol = tutor_role.id_rol AND tutor_role_name.nombre_rol = 'PADRE' " +
        'JOIN terapeutas ter ON ter.id_terapeuta = link.id_terapeuta ' +
        'JOIN usuarios ue ON ue.id_usuario = ter.id_usuario ' +
        'JOIN usuario_roles therapist_role ON therapist_role.id_usuario = ue.id_usuario AND therapist_role.activo = true ' +
        "JOIN roles therapist_role_name ON therapist_role_name.id_rol = therapist_role.id_rol AND therapist_role_name.nombre_rol = 'TERAPEUTA' " +
        'WHERE ut.activo = true AND ue.activo = true AND ' + actor + ' = $1 ' +
        'ORDER BY tutor_nombre, terapeuta_nombre;',
      [user.id_usuario],
    );
    const items = result.rows.map(mapContact);
    return { items, total: items.length };
  }

  async listar(
    user: AuthenticatedUser,
    limit = 20,
    beforeId?: number,
  ): Promise<{ items: ConversationItem[]; next_before_id: number | null }> {
    requireMessagingRole(user);
    const actor = actorColumn(user, 'tut', 'ter');
    const safeLimit = clampLimit(limit, 20);
    const params: unknown[] = [user.id_usuario];
    let cursor = '';
    if (beforeId !== undefined) {
      const safeBeforeId = parsePositiveId(beforeId, 'Conversación');
      params.push(safeBeforeId);
      cursor = ' AND c.id_conversacion < $' + params.length;
    }
    params.push(safeLimit + 1);
    const result = await pool.query(
      'SELECT c.id_conversacion, c.id_tutor, c.id_terapeuta, ' +
        `COALESCE(c.estado, 'ACTIVA') AS estado, ` +
        'COALESCE(c.ultima_actividad, c.fecha_creacion, NOW()) AS ultima_actividad, ' +
        'tut.id_usuario AS id_usuario_tutor, ter.id_usuario AS id_usuario_terapeuta, ' +
        `CONCAT(ut.nombres, ' ', COALESCE(ut.apellidos, '')) AS tutor_nombre, ` +
        `CONCAT(ue.nombres, ' ', COALESCE(ue.apellidos, '')) AS terapeuta_nombre, ` +
        "(UPPER(COALESCE(c.estado, 'ACTIVA')) = 'ACTIVA' AND EXISTS (" +
          'SELECT 1 FROM (' + activeLinksSql + ') active_link ' +
          'WHERE active_link.id_tutor = c.id_tutor AND active_link.id_terapeuta = c.id_terapeuta' +
        ')) AS puede_enviar ' +
        'FROM conversaciones c ' +
        'JOIN tutores tut ON tut.id_tutor = c.id_tutor ' +
        'JOIN usuarios ut ON ut.id_usuario = tut.id_usuario ' +
        'JOIN terapeutas ter ON ter.id_terapeuta = c.id_terapeuta ' +
        'JOIN usuarios ue ON ue.id_usuario = ter.id_usuario ' +
        'WHERE ' + actor + ' = $1 ' +
        'AND EXISTS (SELECT 1 FROM (' + readableLinksSql + ') readable_link ' +
          'WHERE readable_link.id_tutor = c.id_tutor AND readable_link.id_terapeuta = c.id_terapeuta)' +
        cursor +
        ' ORDER BY c.id_conversacion DESC LIMIT $' + params.length + ';',
      params,
    );
    const rows = result.rows;
    const page = rows.slice(0, safeLimit);
    return {
      items: page.map(mapConversation),
      next_before_id: rows.length > safeLimit ? Number(page[page.length - 1].id_conversacion) : null,
    };
  }

  async abrir(
    user: AuthenticatedUser,
    requestedTutorId: number,
    requestedTherapistId: number,
  ): Promise<ConversationItem> {
    requireMessagingRole(user);
    const tutorId = user.rol === 'PADRE'
      ? await this.getTutorId(user.id_usuario)
      : parsePositiveId(requestedTutorId, 'Familia');
    const therapistId = user.rol === 'TERAPEUTA'
      ? await this.getCurrentTherapistId(user.id_usuario)
      : parsePositiveId(requestedTherapistId, 'Terapeuta');
    const actor = user.rol === 'PADRE' ? 'tut.id_usuario' : 'ter.id_usuario';
    const client: PoolClient = await pool.connect();
    let conversationId: number | undefined;
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1::integer, $2::integer);', [tutorId, therapistId]);
      const allowed = await client.query(
        'SELECT 1 FROM tutores tut ' +
          'JOIN usuarios ut ON ut.id_usuario = tut.id_usuario AND ut.activo = true ' +
          'JOIN usuario_roles tutor_role ON tutor_role.id_usuario = ut.id_usuario AND tutor_role.activo = true ' +
          "JOIN roles tutor_role_name ON tutor_role_name.id_rol = tutor_role.id_rol AND tutor_role_name.nombre_rol = 'PADRE' " +
          'JOIN terapeutas ter ON ter.id_terapeuta = $2 ' +
          'JOIN usuarios ue ON ue.id_usuario = ter.id_usuario AND ue.activo = true ' +
          'JOIN usuario_roles therapist_role ON therapist_role.id_usuario = ue.id_usuario AND therapist_role.activo = true ' +
          "JOIN roles therapist_role_name ON therapist_role_name.id_rol = therapist_role.id_rol AND therapist_role_name.nombre_rol = 'TERAPEUTA' " +
          'WHERE tut.id_tutor = $1 AND ' + actor + ' = $3 ' +
          'AND EXISTS (SELECT 1 FROM (' + activeLinksSql + ') active_link ' +
            'WHERE active_link.id_tutor = tut.id_tutor AND active_link.id_terapeuta = ter.id_terapeuta) LIMIT 1;',
        [tutorId, therapistId, user.id_usuario],
      );
      if (!allowed.rows.length) throw fail('Asignación no encontrada.');
      const existing = await client.query(
        'SELECT id_conversacion FROM conversaciones ' +
          'WHERE id_tutor = $1 AND id_terapeuta = $2 ' +
          'ORDER BY ultima_actividad DESC, id_conversacion DESC LIMIT 1;',
        [tutorId, therapistId],
      );
      if (existing.rows[0]) {
        conversationId = Number(existing.rows[0].id_conversacion);
      } else {
        const created = await client.query(
          "INSERT INTO conversaciones (id_tutor, id_terapeuta, estado, fecha_creacion, ultima_actividad) " +
            "VALUES ($1, $2, 'ACTIVA', NOW(), NOW()) RETURNING id_conversacion;",
          [tutorId, therapistId],
        );
        conversationId = Number(created.rows[0].id_conversacion);
      }
      await client.query('COMMIT;');
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
    const detail = await this.detalle(user, conversationId!);
    if (!detail) throw fail('Conversación no encontrada.');
    return detail;
  }

  async detalle(user: AuthenticatedUser, id: number): Promise<ConversationItem | null> {
    requireMessagingRole(user);
    const key = parsePositiveId(id, 'Conversación');
    const actor = actorColumn(user, 'tut', 'ter');
    const result = await pool.query(
      'SELECT c.id_conversacion, c.id_tutor, c.id_terapeuta, ' +
        `COALESCE(c.estado, 'ACTIVA') AS estado, ` +
        'COALESCE(c.ultima_actividad, c.fecha_creacion, NOW()) AS ultima_actividad, ' +
        'tut.id_usuario AS id_usuario_tutor, ter.id_usuario AS id_usuario_terapeuta, ' +
        `CONCAT(ut.nombres, ' ', COALESCE(ut.apellidos, '')) AS tutor_nombre, ` +
        `CONCAT(ue.nombres, ' ', COALESCE(ue.apellidos, '')) AS terapeuta_nombre, ` +
        "(UPPER(COALESCE(c.estado, 'ACTIVA')) = 'ACTIVA' AND EXISTS (" +
          'SELECT 1 FROM (' + activeLinksSql + ') active_link ' +
          'WHERE active_link.id_tutor = c.id_tutor AND active_link.id_terapeuta = c.id_terapeuta' +
        ')) AS puede_enviar ' +
        'FROM conversaciones c ' +
        'JOIN tutores tut ON tut.id_tutor = c.id_tutor ' +
        'JOIN usuarios ut ON ut.id_usuario = tut.id_usuario ' +
        'JOIN terapeutas ter ON ter.id_terapeuta = c.id_terapeuta ' +
        'JOIN usuarios ue ON ue.id_usuario = ter.id_usuario ' +
        'WHERE c.id_conversacion = $1 AND ' + actor + ' = $2 ' +
        'AND EXISTS (SELECT 1 FROM (' + readableLinksSql + ') readable_link ' +
          'WHERE readable_link.id_tutor = c.id_tutor AND readable_link.id_terapeuta = c.id_terapeuta) LIMIT 1;',
      [key, user.id_usuario],
    );
    return result.rows[0] ? mapConversation(result.rows[0]) : null;
  }

  async getMensajes(
    user: AuthenticatedUser,
    conversationId: number,
    limit = 30,
    beforeId?: number,
  ): Promise<{ items: MessageItem[]; next_before_id: number | null }> {
    const conversation = await this.detalle(user, conversationId);
    if (!conversation) throw fail('Conversación no encontrada.');
    const safeLimit = clampLimit(limit, 30);
    const params: unknown[] = [conversation.id_conversacion];
    let cursor = '';
    if (beforeId !== undefined) {
      params.push(parsePositiveId(beforeId, 'Mensaje'));
      cursor = ' AND id_mensaje < $' + params.length;
    }
    params.push(safeLimit + 1);
    const result = await pool.query(
      'SELECT id_mensaje, id_conversacion, id_usuario_emisor, texto_mensaje, fecha_envio ' +
        'FROM mensajes WHERE id_conversacion = $1' + cursor +
        ' ORDER BY id_mensaje DESC LIMIT $' + params.length + ';',
      params,
    );
    const rows = result.rows;
    const page = rows.slice(0, safeLimit);
    const messageIds = page.map((row) => Number(row.id_mensaje));
    const attachmentResult = messageIds.length
      ? await pool.query(
          'SELECT id_adjunto, id_mensaje, nombre_archivo, mime_type, tamano_bytes, duracion_segundos ' +
            'FROM mensaje_adjuntos WHERE id_mensaje = ANY($1::integer[]) ORDER BY id_adjunto;',
          [messageIds],
        )
      : { rows: [] };
    const attachmentsByMessage = new Map<number, AttachmentItem[]>();
    for (const row of attachmentResult.rows) {
      const attachment = mapAttachment(row);
      const messageId = Number(row.id_mensaje);
      attachmentsByMessage.set(messageId, [...(attachmentsByMessage.get(messageId) ?? []), attachment]);
    }
    return {
      items: page.map((row) => mapMessage(row, attachmentsByMessage.get(Number(row.id_mensaje)) ?? [])),
      next_before_id: rows.length > safeLimit ? Number(page[page.length - 1].id_mensaje) : null,
    };
  }

  async enviar(user: AuthenticatedUser, conversationId: number, text: string): Promise<MessageItem> {
    const conversation = await this.detalle(user, conversationId);
    if (!conversation) throw fail('Conversación no encontrada.');
    if (!conversation.puede_enviar) throw fail('Esta conversación está en modo de solo lectura.', 403);
    const content = typeof text === 'string' ? text.trim() : '';
    if (!content || content.length > 4000) throw fail('El mensaje debe contener entre 1 y 4000 caracteres.', 400);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await this.insertTextMessage(client, user, conversation.id_conversacion, content);
      if (!inserted) throw fail('Esta conversación está en modo de solo lectura.', 403);
      await client.query('UPDATE conversaciones SET ultima_actividad = NOW() WHERE id_conversacion = $1;', [conversation.id_conversacion]);
      await client.query('COMMIT;');
      return mapMessage(inserted);
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }

  private async insertTextMessage(client: PoolClient, user: AuthenticatedUser, conversationId: number, text: string) {
    const actor = actorColumn(user, 'tut', 'ter');
    const result = await client.query(
      'INSERT INTO mensajes (id_conversacion, id_usuario_emisor, texto_mensaje, fecha_envio, leido) ' +
        'SELECT c.id_conversacion, $2, $3, NOW(), false ' +
        'FROM conversaciones c ' +
        'JOIN tutores tut ON tut.id_tutor = c.id_tutor ' +
        'JOIN terapeutas ter ON ter.id_terapeuta = c.id_terapeuta ' +
        'WHERE c.id_conversacion = $1 AND ' + actor + ' = $2 ' +
        "AND UPPER(COALESCE(c.estado, 'ACTIVA')) = 'ACTIVA' " +
        'AND EXISTS (SELECT 1 FROM (' + activeLinksSql + ') active_link ' +
          'WHERE active_link.id_tutor = c.id_tutor AND active_link.id_terapeuta = c.id_terapeuta) ' +
        'RETURNING id_mensaje, id_conversacion, id_usuario_emisor, texto_mensaje, fecha_envio;',
      [conversationId, user.id_usuario, text],
    );
    return result.rows[0] ?? null;
  }

  async guardarAdjunto(
    user: AuthenticatedUser,
    conversationId: number,
    file: UploadedAttachment | undefined,
    text: string,
    idempotencyKey: string,
  ): Promise<MessageItem> {
    requireMessagingRole(user);
    const conversation = await this.detalle(user, conversationId);
    if (!conversation) throw fail('Conversación no encontrada.');
    if (!conversation.puede_enviar) throw fail('Esta conversación está en modo de solo lectura.', 403);
    if (!file || !Buffer.isBuffer(file.buffer) || file.size !== file.buffer.length || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      throw fail('Selecciona un archivo no vacío de hasta 10 MB.', 400);
    }
    const mimeType = String(file.mimetype || '').toLowerCase();
    if (!supportedMimeTypes.has(mimeType)) throw fail('El tipo de archivo no está permitido.', 400);
    const cleanName = String(file.originalname || 'archivo')
      .replace(/[\\/\r\n\0]/g, '_')
      .trim()
      .slice(0, 255) || 'archivo';
    const content = typeof text === 'string' ? text.trim() : '';
    if (content.length > 4000) throw fail('El mensaje no puede superar los 4000 caracteres.', 400);
    if (typeof idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      throw fail('Clave de envío inválida.', 400);
    }
    const hash = createHash('sha256').update(file.buffer).digest('hex');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        'SELECT ma.id_adjunto, ma.id_mensaje, m.id_conversacion, ma.sha256, m.id_usuario_emisor, ' +
          'm.texto_mensaje, m.fecha_envio, ma.nombre_archivo, ma.mime_type, ma.tamano_bytes, ma.duracion_segundos ' +
        'FROM mensaje_adjuntos ma JOIN mensajes m ON m.id_mensaje = ma.id_mensaje ' +
        'WHERE ma.clave_envio = $1 LIMIT 1;',
        [idempotencyKey],
      );
      if (existing.rows[0]) {
        const row = existing.rows[0];
        if (Number(row.id_conversacion) !== conversation.id_conversacion || row.sha256 !== hash) {
          throw fail('La clave de envío ya fue utilizada.', 409);
        }
        const detail = await client.query(
          'SELECT 1 FROM conversaciones c ' +
            'JOIN tutores tut ON tut.id_tutor = c.id_tutor ' +
            'JOIN terapeutas ter ON ter.id_terapeuta = c.id_terapeuta ' +
            'WHERE c.id_conversacion = $1 AND ' + actorColumn(user, 'tut', 'ter') + ' = $2 ' +
            'AND EXISTS (SELECT 1 FROM (' + readableLinksSql + ') readable_link ' +
              'WHERE readable_link.id_tutor = c.id_tutor AND readable_link.id_terapeuta = c.id_terapeuta) LIMIT 1;',
          [conversation.id_conversacion, user.id_usuario],
        );
        if (!detail.rows.length) throw fail('Conversación no encontrada.');
        await client.query('COMMIT;');
        return mapMessage(row, [mapAttachment(row)]);
      }

      const inserted = await this.insertTextMessage(client, user, conversation.id_conversacion, content || '');
      if (!inserted) throw fail('Esta conversación está en modo de solo lectura.', 403);
      const attachmentResult = await client.query(
        'INSERT INTO mensaje_adjuntos ' +
          '(id_mensaje, url_archivo, nombre_archivo, mime_type, tamano_bytes, duracion_segundos, contenido, clave_envio, sha256) ' +
          "VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8) " +
          'RETURNING id_adjunto, id_mensaje, nombre_archivo, mime_type, tamano_bytes, duracion_segundos;',
        [
          inserted.id_mensaje,
          'db://mensaje-adjuntos/' + inserted.id_mensaje,
          cleanName,
          mimeType,
          file.size,
          file.buffer,
          idempotencyKey,
          hash,
        ],
      );
      await client.query('UPDATE conversaciones SET ultima_actividad = NOW() WHERE id_conversacion = $1;', [conversation.id_conversacion]);
      await client.query('COMMIT;');
      return mapMessage(inserted, [mapAttachment(attachmentResult.rows[0])]);
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }

  async descargarAdjunto(
    user: AuthenticatedUser,
    conversationId: number,
    attachmentId: number,
  ): Promise<DownloadableAttachment | null> {
    const conversation = await this.detalle(user, conversationId);
    if (!conversation) return null;
    const id = parsePositiveId(attachmentId, 'Adjunto');
    const result = await pool.query(
      'SELECT ma.id_adjunto, ma.nombre_archivo, ma.mime_type, ma.tamano_bytes, ma.duracion_segundos, ma.contenido ' +
        'FROM mensaje_adjuntos ma ' +
        'JOIN mensajes m ON m.id_mensaje = ma.id_mensaje ' +
        'WHERE m.id_conversacion = $1 AND ma.id_adjunto = $2 AND ma.contenido IS NOT NULL LIMIT 1;',
      [conversation.id_conversacion, id],
    );
    if (!result.rows[0]) return null;
    return { ...mapAttachment(result.rows[0]), contenido: result.rows[0].contenido as Buffer };
  }

  async getMensajesLegacy(user: AuthenticatedUser, counterpartUserId?: number): Promise<LegacyMessageItem[]> {
    requireMessagingRole(user);
    const actor = actorColumn(user, 'tut', 'ter');
    const params: unknown[] = [user.id_usuario];
    let counterpart = '';
    if (counterpartUserId !== undefined) {
      const id = parsePositiveId(counterpartUserId, 'Contacto');
      params.push(id);
      counterpart = user.rol === 'PADRE'
        ? ' AND ter.id_usuario = $' + params.length
        : ' AND tut.id_usuario = $' + params.length;
    }
    const result = await pool.query(
      'SELECT m.id_mensaje, m.id_conversacion, m.id_usuario_emisor, m.texto_mensaje, m.fecha_envio, m.leido, ' +
        'tut.id_usuario AS id_usuario_tutor, ter.id_usuario AS id_usuario_terapeuta ' +
        'FROM conversaciones c ' +
        'JOIN tutores tut ON tut.id_tutor = c.id_tutor ' +
        'JOIN terapeutas ter ON ter.id_terapeuta = c.id_terapeuta ' +
        'JOIN mensajes m ON m.id_conversacion = c.id_conversacion ' +
        'WHERE ' + actor + ' = $1 ' +
        'AND EXISTS (SELECT 1 FROM (' + readableLinksSql + ') readable_link ' +
          'WHERE readable_link.id_tutor = c.id_tutor AND readable_link.id_terapeuta = c.id_terapeuta)' +
        counterpart +
        ' ORDER BY m.fecha_envio, m.id_mensaje;',
      params,
    );
    return result.rows.map((row) => mapLegacyMessage(row, user.id_usuario));
  }

  async enviarLegacy(
    user: AuthenticatedUser,
    recipientUserId: number,
    text: string,
  ): Promise<LegacyMessageItem> {
    requireMessagingRole(user);
    const recipientId = parsePositiveId(recipientUserId, 'Contacto');
    const contacts = await this.getContactos(user);
    let pair: ContactItem | undefined;
    if (user.rol === 'PADRE') {
      const therapist = await pool.query(
        'SELECT id_terapeuta FROM terapeutas WHERE id_usuario = $1 LIMIT 1;',
        [recipientId],
      );
      if (therapist.rows[0]) {
        pair = contacts.items.find((item) => item.id_terapeuta === Number(therapist.rows[0].id_terapeuta));
      }
    } else {
      const tutor = await pool.query(
        'SELECT id_tutor FROM tutores WHERE id_usuario = $1 LIMIT 1;',
        [recipientId],
      );
      if (tutor.rows[0]) {
        pair = contacts.items.find((item) => item.id_tutor === Number(tutor.rows[0].id_tutor));
      }
    }
    if (!pair) throw fail('Asignación no encontrada.');
    const conversation = await this.abrir(user, pair.id_tutor, pair.id_terapeuta);
    const message = await this.enviar(user, conversation.id_conversacion, text);
    return mapLegacyMessage({
      ...message,
      id_usuario_tutor: conversation.id_usuario_tutor,
      id_usuario_terapeuta: conversation.id_usuario_terapeuta,
    }, user.id_usuario);
  }
}

export const conversacionesService = new ConversacionesService();

