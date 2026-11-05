import { pool } from '../../core/database.js';
import { WhatsAppService } from '../../infrastructure/whatsapp/whatsapp.service.js';
import { MSG, normalizeCommand, processMessage, type BotDraft, type BotState } from './whatsapp.bot.js';

export interface IncomingMessage {
  wamid: string;
  /** Teléfono (`from` de Meta). Nunca proviene de datos escritos por el cliente. */
  from: string;
  /** Texto del mensaje o null si no es de tipo texto. */
  text: string | null;
}

const KNOWN_STATES: BotState[] = ['INICIO', 'CONSENTIMIENTO', 'NOMBRES', 'APELLIDOS', 'DNI', 'CORREO', 'CONFIRMAR', 'FINALIZADA'];

function asState(value: unknown): BotState {
  return KNOWN_STATES.includes(value as BotState) ? (value as BotState) : 'INICIO';
}

function asDraft(value: unknown): BotDraft {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as BotDraft) : {};
}

/**
 * Procesa un mensaje entrante: deduplica por wamid, serializa por teléfono con
 * SELECT ... FOR UPDATE, avanza la máquina de estados y devuelve la respuesta a enviar
 * (o null si el mensaje ya estaba procesado). Los fallos del proveedor no se manejan aquí.
 */
export async function applyIncomingMessage(msg: IncomingMessage, now = new Date()): Promise<string | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');

    const dedupe = await client.query(
      `INSERT INTO public.whatsapp_mensajes_procesados (wamid) VALUES ($1)
       ON CONFLICT (wamid) DO NOTHING RETURNING wamid;`,
      [msg.wamid],
    );
    if (dedupe.rowCount === 0) {
      await client.query('ROLLBACK;');
      return null;
    }

    // Garantiza la fila y la bloquea: dos mensajes seguidos del mismo número se procesan en orden.
    await client.query(
      `INSERT INTO public.whatsapp_conversaciones (telefono) VALUES ($1) ON CONFLICT (telefono) DO NOTHING;`,
      [msg.from],
    );
    const convResult = await client.query(
      `SELECT estado, datos, ultimo_mensaje_en FROM public.whatsapp_conversaciones WHERE telefono = $1 FOR UPDATE;`,
      [msg.from],
    );
    const conv = convResult.rows[0] as { estado: unknown; datos: unknown; ultimo_mensaje_en: Date };

    // Una solicitud abierta o aprobada manda sobre el flujo: no se crea otra.
    const latest = await client.query(
      `SELECT estado FROM public.solicitudes_acceso_familia
        WHERE telefono = $1 ORDER BY creado_en DESC, id_solicitud DESC LIMIT 1;`,
      [msg.from],
    );
    const latestEstado = latest.rows[0]?.estado as string | undefined;
    if (latestEstado === 'PENDIENTE' && msg.text !== null && normalizeCommand(msg.text) === 'CANCELAR') {
      // Cumple el aviso de privacidad: antes de aprobarse, la familia puede retirar sus datos.
      // Solo borra PENDIENTE: si un admin ya la tomó (PROCESANDO), sigue en revisión.
      const removed = await client.query(
        `DELETE FROM public.solicitudes_acceso_familia WHERE telefono = $1 AND estado = 'PENDIENTE';`,
        [msg.from],
      );
      if (removed.rowCount) {
        await client.query(
          `UPDATE public.whatsapp_conversaciones SET estado = 'INICIO', datos = '{}'::jsonb, ultimo_mensaje_en = $2 WHERE telefono = $1;`,
          [msg.from, now],
        );
        await client.query('COMMIT;');
        return MSG.cancelado;
      }
    }
    if (latestEstado === 'PENDIENTE' || latestEstado === 'PROCESANDO' || latestEstado === 'APROBADA') {
      if (latestEstado !== 'APROBADA') {
        // Mantiene viva la ventana de 24 h de WhatsApp mientras la solicitud esté abierta.
        await client.query(
          `UPDATE public.solicitudes_acceso_familia SET ultimo_mensaje_en = $2
            WHERE telefono = $1 AND estado IN ('PENDIENTE', 'PROCESANDO');`,
          [msg.from, now],
        );
      }
      await client.query(`UPDATE public.whatsapp_conversaciones SET ultimo_mensaje_en = $2 WHERE telefono = $1;`, [msg.from, now]);
      await client.query('COMMIT;');
      return latestEstado === 'APROBADA' ? MSG.aprobada : MSG.enRevision;
    }

    const output = processMessage({
      state: asState(conv.estado),
      data: asDraft(conv.datos),
      text: msg.text,
      now,
      lastMessageAt: conv.ultimo_mensaje_en ? new Date(conv.ultimo_mensaje_en) : null,
    });

    let reply = output.reply;
    let finalState = output.state;
    let finalData = output.data;

    if (output.crearSolicitud && output.solicitud) {
      const s = output.solicitud;
      const inserted = await client.query(
        `INSERT INTO public.solicitudes_acceso_familia
           (telefono, nombres, apellidos, dni, email, estado, consentimiento_en, ultimo_mensaje_en)
         VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7)
         ON CONFLICT (telefono) WHERE estado IN ('PENDIENTE', 'PROCESANDO') DO NOTHING
         RETURNING id_solicitud;`,
        [msg.from, s.nombres, s.apellidos, s.dni, s.email, s.consentimiento_en, now],
      );
      if (inserted.rowCount === 0) {
        reply = MSG.enRevision;
        finalState = 'FINALIZADA';
        finalData = {};
      }
    }

    await client.query(
      `UPDATE public.whatsapp_conversaciones
          SET estado = $2, datos = $3::jsonb, ultimo_mensaje_en = $4
        WHERE telefono = $1;`,
      [msg.from, finalState, JSON.stringify(finalData), now],
    );

    await client.query('COMMIT;');
    return reply;
  } catch (err) {
    await client.query('ROLLBACK;').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Borra borradores abandonados (contienen DNI y correo) e ids de mensajes que Meta ya no reintenta. */
export async function purgeStaleData(): Promise<void> {
  await pool.query(
    `UPDATE public.whatsapp_conversaciones SET estado = 'INICIO', datos = '{}'::jsonb
      WHERE ultimo_mensaje_en < now() - interval '24 hours' AND datos <> '{}'::jsonb;`,
  );
  await pool.query(`DELETE FROM public.whatsapp_mensajes_procesados WHERE recibido_en < now() - interval '7 days';`);
}

/** Procesa y responde un mensaje. Nunca lanza y nunca registra contenido personal. */
export async function handleIncomingMessage(msg: IncomingMessage): Promise<void> {
  try {
    const reply = await applyIncomingMessage(msg);
    if (reply) await WhatsAppService.sendText(msg.from, reply);
    await purgeStaleData();
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    console.error('[WhatsApp] No se pudo procesar un mensaje entrante', code ? `(código ${code})` : '');
  }
}
