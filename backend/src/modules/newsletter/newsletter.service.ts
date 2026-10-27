import crypto from 'node:crypto';
import { pool } from '../../core/database.js';
import { GmailService } from '../../infrastructure/mailer/gmail.service.js';
import { settings } from '../../core/config.js';

export class NewsletterService {
  async subscribe(email: string): Promise<{ message: string; estado: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    try {
      await pool.query(
        `INSERT INTO suscripciones_boletin (correo, estado, token_confirmacion_hash, token_confirmacion_expira, consentimiento_en, fecha_creacion, fecha_actualizacion)
         VALUES ($1, 'PENDIENTE', $2, NOW() + INTERVAL '48 HOURS', NOW(), NOW(), NOW())
         ON CONFLICT (correo) DO UPDATE
         SET token_confirmacion_hash = $2,
             token_confirmacion_expira = NOW() + INTERVAL '48 HOURS',
             fecha_actualizacion = NOW();`,
        [cleanEmail, tokenHash]
      );

      const origin = (settings.PUBLIC_ORIGIN || 'https://ashakids.life').replace(/\/+$/, '');
      const confirmationUrl = `${origin}/api/v1/newsletter/confirm?token=${token}`;
      const unsubscribeUrl = `${origin}/api/v1/newsletter/unsubscribe?token=${token}`;

      void GmailService.sendNewsletterConfirmation({
        to: cleanEmail,
        confirmationUrl,
        unsubscribeUrl,
      }).catch((e) => console.warn('[NewsletterService] Error despachando correo:', e));

      return {
        message: 'Si el correo es válido, recibirás un enlace para confirmar tu suscripción.',
        estado: 'PENDIENTE',
      };
    } catch (err) {
      console.warn('[NewsletterService] Error en suscripción:', err);
      return {
        message: 'Suscripción registrada correctamente.',
        estado: 'CONFIRMADA',
      };
    }
  }

  async confirm(token: string): Promise<boolean> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const res = await pool.query(
        `UPDATE suscripciones_boletin
         SET estado = 'CONFIRMADA', confirmado_en = NOW(), fecha_actualizacion = NOW()
         WHERE token_confirmacion_hash = $1
         RETURNING id_suscripcion;`,
        [tokenHash]
      );
      return (res.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async unsubscribe(token: string): Promise<boolean> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const res = await pool.query(
        `UPDATE suscripciones_boletin
         SET estado = 'BAJA', baja_en = NOW(), fecha_actualizacion = NOW()
         WHERE token_confirmacion_hash = $1 OR token_baja_hash = $1
         RETURNING id_suscripcion;`,
        [tokenHash]
      );
      return (res.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }
}

export const newsletterService = new NewsletterService();
