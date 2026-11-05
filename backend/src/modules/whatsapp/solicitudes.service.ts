import { pool } from '../../core/database.js';
import { settings } from '../../core/config.js';
import { WhatsAppService, type WhatsAppSendResult } from '../../infrastructure/whatsapp/whatsapp.service.js';
import { adminService } from '../admin/services/admin.service.js';
import { maskEmail } from './whatsapp.bot.js';

export const SOLICITUD_ESTADOS = ['PENDIENTE', 'PROCESANDO', 'APROBADA', 'RECHAZADA'] as const;
export type SolicitudEstado = (typeof SOLICITUD_ESTADOS)[number];

export type AvisoWhatsAppEstado = 'ENVIADO' | 'NO_CONFIGURADO' | 'ERROR' | 'FUERA_DE_VENTANA' | 'OMITIDO';

export interface SolicitudAcceso {
  id_solicitud: number;
  telefono: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  estado: SolicitudEstado;
  consentimiento_en: string;
  id_usuario_creado: number | null;
  revisado_por: number | null;
  revisado_en: string | null;
  correo_estado: string | null;
  aviso_whatsapp_estado: string | null;
  ultimo_mensaje_en: string;
  creado_en: string;
}

export interface ResultadoSolicitud {
  message: string;
  solicitud: SolicitudAcceso;
  correo_bienvenida?: string | null;
  aviso_whatsapp?: AvisoWhatsAppEstado;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;
/** Longitud de tutores.telefono en docker/init.sql: varchar(12). */
const TUTOR_PHONE_MAX = 12;

export function httpError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status });
}

function toSolicitud(row: Record<string, unknown>): SolicitudAcceso {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v == null ? null : String(v));
  return {
    id_solicitud: Number(row.id_solicitud),
    telefono: String(row.telefono),
    nombres: String(row.nombres),
    apellidos: String(row.apellidos),
    dni: String(row.dni),
    email: String(row.email),
    estado: row.estado as SolicitudEstado,
    consentimiento_en: iso(row.consentimiento_en) as string,
    id_usuario_creado: row.id_usuario_creado == null ? null : Number(row.id_usuario_creado),
    revisado_por: row.revisado_por == null ? null : Number(row.revisado_por),
    revisado_en: iso(row.revisado_en),
    correo_estado: row.correo_estado == null ? null : String(row.correo_estado),
    aviso_whatsapp_estado: row.aviso_whatsapp_estado == null ? null : String(row.aviso_whatsapp_estado),
    ultimo_mensaje_en: iso(row.ultimo_mensaje_en) as string,
    creado_en: iso(row.creado_en) as string,
  };
}

function inWindow(lastMessageAt: string): boolean {
  return Date.now() - new Date(lastMessageAt).getTime() < WINDOW_MS;
}

function avisoFrom(result: WhatsAppSendResult): AvisoWhatsAppEstado {
  return result.status;
}

/** Envía texto dentro de la ventana de 24 h; fuera de ella, la plantilla si existe. */
async function notify(
  solicitud: SolicitudAcceso,
  text: string,
  template?: { name: string; params: string[] },
): Promise<AvisoWhatsAppEstado> {
  if (inWindow(solicitud.ultimo_mensaje_en)) {
    return avisoFrom(await WhatsAppService.sendText(solicitud.telefono, text));
  }
  if (template?.name) {
    return avisoFrom(
      await WhatsAppService.sendTemplate(solicitud.telefono, template.name, settings.WHATSAPP_TEMPLATE_LANG, template.params),
    );
  }
  return 'FUERA_DE_VENTANA';
}

export async function listarSolicitudes(estado?: string): Promise<{ items: SolicitudAcceso[]; total: number }> {
  const params: unknown[] = [];
  let where = '';
  if (estado) {
    params.push(estado);
    where = 'WHERE estado = $1';
  }
  const res = await pool.query(
    `SELECT * FROM public.solicitudes_acceso_familia ${where} ORDER BY creado_en DESC, id_solicitud DESC LIMIT 200;`,
    params,
  );
  const items = res.rows.map(toSolicitud);
  return { items, total: items.length };
}

async function conflictOrMissing(id: number, conflictMessage: string): Promise<Error> {
  const exists = await pool.query(`SELECT 1 FROM public.solicitudes_acceso_familia WHERE id_solicitud = $1;`, [id]);
  return exists.rowCount ? httpError(409, conflictMessage) : httpError(404, 'Solicitud no encontrada.');
}

export async function aprobarSolicitud(id: number, adminId: number): Promise<ResultadoSolicitud> {
  // Claim atómico: solo una petición pasa de PENDIENTE a PROCESANDO.
  const claim = await pool.query(
    `UPDATE public.solicitudes_acceso_familia SET estado = 'PROCESANDO'
      WHERE id_solicitud = $1 AND estado = 'PENDIENTE' RETURNING *;`,
    [id],
  );
  if (claim.rowCount === 0) throw await conflictOrMissing(id, 'La solicitud ya fue procesada.');
  const claimed = toSolicitud(claim.rows[0]);

  let created: Awaited<ReturnType<typeof adminService.crearPadre>>;
  try {
    created = await adminService.crearPadre({
      nombres: claimed.nombres,
      apellidos: claimed.apellidos,
      email: claimed.email,
      telefono: claimed.telefono.length <= TUTOR_PHONE_MAX ? claimed.telefono : undefined,
    });
  } catch (err) {
    await pool.query(
      `UPDATE public.solicitudes_acceso_familia SET estado = 'PENDIENTE' WHERE id_solicitud = $1 AND estado = 'PROCESANDO';`,
      [id],
    );
    const dbError = err as { code?: string; constraint?: string } | null;
    if (dbError?.code === '23505' && dbError.constraint === 'usuarios_email_key') {
      throw httpError(409, 'Ya existe una cuenta con ese correo.');
    }
    throw err;
  }

  const correo = (created.correo_bienvenida ?? null) as string | null;
  const idUsuario = Number((created.cuenta as Record<string, unknown>).id_usuario);

  const approved = await pool.query(
    `UPDATE public.solicitudes_acceso_familia
        SET estado = 'APROBADA', id_usuario_creado = $2, revisado_por = $3, revisado_en = now(), correo_estado = $4
      WHERE id_solicitud = $1 RETURNING *;`,
    [id, idUsuario, adminId, correo],
  );
  let solicitud = toSolicitud(approved.rows[0]);

  // Solo se avisa a la familia si el correo realmente salió.
  let aviso: AvisoWhatsAppEstado = 'OMITIDO';
  if (correo === 'ENVIADO') {
    const masked = maskEmail(solicitud.email);
    const text =
      `¡Buenas noticias! Aprobamos tu solicitud. Te enviamos a tu correo (${masked}) el enlace para activar tu cuenta ` +
      'y crear tu contraseña. El enlace vence en 2 horas. 💜';
    aviso = await notify(solicitud, text, {
      name: settings.WHATSAPP_TEMPLATE_ACTIVACION,
      params: [solicitud.nombres, masked],
    });
  }
  const saved = await pool.query(
    `UPDATE public.solicitudes_acceso_familia SET aviso_whatsapp_estado = $2 WHERE id_solicitud = $1 RETURNING *;`,
    [id, aviso],
  );
  solicitud = toSolicitud(saved.rows[0]);

  const message =
    correo === 'ENVIADO'
      ? 'Solicitud aprobada. La cuenta se creó y el enlace de activación se envió al correo.'
      : 'Solicitud aprobada y cuenta creada, pero el correo de activación NO salió. Usa el reenvío de activación para enviarlo.';
  return { message, solicitud, correo_bienvenida: correo, aviso_whatsapp: aviso };
}

export async function rechazarSolicitud(id: number, adminId: number): Promise<ResultadoSolicitud> {
  const updated = await pool.query(
    `UPDATE public.solicitudes_acceso_familia
        SET estado = 'RECHAZADA', revisado_por = $2, revisado_en = now()
      WHERE id_solicitud = $1 AND estado = 'PENDIENTE' RETURNING *;`,
    [id, adminId],
  );
  if (updated.rowCount === 0) throw await conflictOrMissing(id, 'La solicitud ya fue procesada.');
  let solicitud = toSolicitud(updated.rows[0]);

  const aviso: AvisoWhatsAppEstado = inWindow(solicitud.ultimo_mensaje_en)
    ? avisoFrom(
        await WhatsAppService.sendText(
          solicitud.telefono,
          'Hola. Revisamos tu solicitud de acceso a Ashakids y por ahora no pudimos aprobarla. ' +
            'Si crees que es un error, comunícate con el equipo de Ashakids.',
        ),
      )
    : 'FUERA_DE_VENTANA';
  const saved = await pool.query(
    `UPDATE public.solicitudes_acceso_familia SET aviso_whatsapp_estado = $2 WHERE id_solicitud = $1 RETURNING *;`,
    [id, aviso],
  );
  solicitud = toSolicitud(saved.rows[0]);
  return { message: 'Solicitud rechazada.', solicitud, aviso_whatsapp: aviso };
}
