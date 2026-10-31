import { settings } from '../../core/config.js';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailSendResult {
  success: boolean;
  status: 'ENVIADO' | 'NO_CONFIGURADO' | 'FALLO';
  messageId?: string;
  error?: string;
}

export class GmailService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  /**
   * Comprueba si Gmail API OAuth está completamente configurado.
   */
  static isConfigured(): boolean {
    return (
      Boolean(settings.GMAIL_ENABLED) &&
      Boolean(settings.GMAIL_CLIENT_ID) &&
      Boolean(settings.GMAIL_CLIENT_SECRET) &&
      Boolean(settings.GMAIL_REFRESH_TOKEN) &&
      Boolean(settings.GMAIL_SENDER_EMAIL)
    );
  }

  /**
   * Obtiene o renueva el token de acceso OAuth2 usando el refresh_token.
   */
  static async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    try {
      const bodyParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: settings.GMAIL_CLIENT_ID,
        client_secret: settings.GMAIL_CLIENT_SECRET,
        refresh_token: settings.GMAIL_REFRESH_TOKEN,
      });

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[GmailService] Error renovando OAuth token:', res.status, errorText);
        return null;
      }

      const data = (await res.json()) as { access_token?: string; expires_in?: number };
      if (!data.access_token) return null;

      this.cachedToken = {
        token: data.access_token,
        expiresAt: now + (data.expires_in ?? 3600) * 1000,
      };

      return data.access_token;
    } catch (err) {
      console.error('[GmailService] Excepción renovando OAuth token:', err);
      return null;
    }
  }

  /**
   * Construye el mensaje RFC 2822 y lo codifica en base64url para la API de Gmail.
   */
  private static buildRawMessage(opts: SendMailOptions): string {
    const senderName = settings.GMAIL_SENDER_NAME || 'Ashakids';
    const senderEmail = settings.GMAIL_SENDER_EMAIL || 'notificaciones@ashakids.life';
    const utf8Subject = `=?UTF-8?B?${Buffer.from(opts.subject, 'utf-8').toString('base64')}?=`;
    const utf8Sender = `=?UTF-8?B?${Buffer.from(senderName, 'utf-8').toString('base64')}?= <${senderEmail}>`;

    const boundary = `ashakids_boundary_${Date.now().toString(16)}`;

    let message = '';
    message += `From: ${utf8Sender}\r\n`;
    message += `To: ${opts.to}\r\n`;
    message += `Subject: ${utf8Subject}\r\n`;
    message += `Date: ${new Date().toUTCString()}\r\n`;
    message += `MIME-Version: 1.0\r\n`;

    if (opts.html) {
      message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
      message += `--${boundary}\r\n`;
      message += `Content-Type: text/plain; charset="UTF-8"\r\n`;
      message += `Content-Transfer-Encoding: base64\r\n\r\n`;
      message += `${Buffer.from(opts.text, 'utf-8').toString('base64')}\r\n\r\n`;
      message += `--${boundary}\r\n`;
      message += `Content-Type: text/html; charset="UTF-8"\r\n`;
      message += `Content-Transfer-Encoding: base64\r\n\r\n`;
      message += `${Buffer.from(opts.html, 'utf-8').toString('base64')}\r\n\r\n`;
      message += `--${boundary}--\r\n`;
    } else {
      message += `Content-Type: text/plain; charset="UTF-8"\r\n`;
      message += `Content-Transfer-Encoding: base64\r\n\r\n`;
      message += `${Buffer.from(opts.text, 'utf-8').toString('base64')}\r\n`;
    }

    // Convertir a base64url sin padding
    return Buffer.from(message, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Envía un correo electrónico genérico a través de Gmail REST API.
   */
  static async sendMail(opts: SendMailOptions): Promise<MailSendResult> {
    if (!this.isConfigured()) {
      console.log(
        `[GmailService] Modo simulado (GMAIL_ENABLED=false o faltan credenciales): Destino=${opts.to}, Asunto="${opts.subject}"`
      );
      return { success: true, status: 'NO_CONFIGURADO' };
    }

    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, status: 'FALLO', error: 'No se pudo obtener el token de acceso OAuth2' };
      }

      const raw = this.buildRawMessage(opts);

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[GmailService] Error en Gmail API send:', res.status, errorText);
        return { success: false, status: 'FALLO', error: `Gmail API ${res.status}: ${errorText}` };
      }

      const data = (await res.json()) as { id?: string };
      return { success: true, status: 'ENVIADO', messageId: data.id };
    } catch (err: any) {
      console.error('[GmailService] Excepción enviando correo:', err);
      return { success: false, status: 'FALLO', error: err?.message || 'Error desconocido' };
    }
  }

  /**
   * Envía correo de bienvenida con credenciales iniciales.
   */
  static async sendWelcomeEmail(params: {
    to: string;
    name: string;
    role: string;
    code: string;
    initialPassword?: string;
  }): Promise<MailSendResult> {
    const origin = (settings.PUBLIC_ORIGIN || 'https://ashakids.life').replace(/\/+$/, '');
    const loginUrl = `${origin}/login`;

    const text = `¡Hola, ${params.name}!

Te damos la bienvenida a ASHAKids, la plataforma integral de desarrollo y rehabilitación de habla y lenguaje infantil.

Tu cuenta como ${params.role} ha sido habilitada exitosamente:
• Código de usuario: ${params.code}
${params.initialPassword ? `• Contraseña provisional: ${params.initialPassword}\n` : ''}
Puedes ingresar a tu panel en: ${loginUrl}

Por seguridad, te recomendamos cambiar tu contraseña una vez que inicies sesión.

Equipo ASHAKids
https://ashakids.life`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background-color: #F8F7FC; color: #1C1135; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #E8E5F4; box-shadow: 0 4px 12px rgba(107, 70, 254, 0.05); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo-badge { display: inline-block; background: #EDE9FE; color: #6B46FE; font-weight: 900; font-size: 20px; padding: 10px 24px; border-radius: 9999px; }
    h1 { font-size: 22px; font-weight: 800; color: #1C1135; margin: 16px 0 8px; text-align: center; }
    p { font-size: 15px; line-height: 1.6; color: #615274; }
    .credentials { background: #F8F7FC; border: 1px dashed #6B46FE; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .cred-item { font-size: 14px; margin: 6px 0; color: #1C1135; font-weight: 700; }
    .cred-val { color: #6B46FE; font-family: monospace; font-size: 16px; font-weight: 800; }
    .btn { display: block; text-align: center; background: #6B46FE; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 16px; margin: 28px 0; }
    .footer { text-align: center; font-size: 12px; color: #9E95B7; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-badge">ASHAKids</div>
      <h1>¡Te damos la bienvenida!</h1>
    </div>
    <p>Hola <strong>${params.name}</strong>,</p>
    <p>Tu cuenta como <strong>${params.role}</strong> está lista para ser utilizada en la plataforma de desarrollo de lenguaje infantil.</p>
    
    <div class="credentials">
      <div class="cred-item">Código de acceso: <span class="cred-val">${params.code}</span></div>
      ${params.initialPassword ? `<div class="cred-item">Contraseña temporal: <span class="cred-val">${params.initialPassword}</span></div>` : ''}
    </div>

    <a href="${loginUrl}" class="btn">Ingresar a mi cuenta</a>

    <p style="font-size: 13px; color: #9E95B7;">Por motivos de seguridad y confidencialidad clínica, recuerda actualizar tu contraseña tras ingresar.</p>
    <div class="footer">
      © ${new Date().getFullYear()} ASHAKids • <a href="https://ashakids.life" style="color: #6B46FE; text-decoration: none;">ashakids.life</a>
    </div>
  </div>
</body>
</html>`;

    return this.sendMail({
      to: params.to,
      subject: '¡Te damos la bienvenida a ASHAKids!',
      text,
      html,
    });
  }

  /**
   * Envía correo de confirmación de cita con enlace de Zoom.
   */
  static async sendAppointmentConfirmation(params: {
    to: string;
    patientOrTherapistName: string;
    topic: string;
    date: string;
    time: string;
    zoomJoinUrl?: string;
  }): Promise<MailSendResult> {
    const isMeet = params.zoomJoinUrl?.includes('meet.google.com');
    const callPlatform = isMeet ? 'Google Meet' : 'Zoom';
    const buttonBg = isMeet ? '#1A73E8' : '#2D8CFF';

    const text = `Hola ${params.patientOrTherapistName},

Se ha confirmado tu cita terapéutica en ASHAKids:
• Motivo: ${params.topic}
• Fecha: ${params.date}
• Hora: ${params.time}
${params.zoomJoinUrl ? `• Enlace de videoconsulta (${callPlatform}): ${params.zoomJoinUrl}\n` : ''}
Te recomendamos conectarte 5 minutos antes de la sesión.

Equipo ASHAKids
https://ashakids.life`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background-color: #F8F7FC; color: #1C1135; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #E8E5F4; }
    .logo-badge { display: inline-block; background: #EDE9FE; color: #6B46FE; font-weight: 900; font-size: 18px; padding: 8px 20px; border-radius: 9999px; }
    h1 { font-size: 20px; font-weight: 800; color: #1C1135; margin: 16px 0; }
    p { font-size: 14px; color: #615274; line-height: 1.6; }
    .details { background: #F8F7FC; border-radius: 16px; padding: 18px; margin: 20px 0; }
    .detail-row { font-size: 14px; margin: 6px 0; color: #1C1135; }
    .btn { display: block; text-align: center; background: ${buttonBg}; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 16px; margin: 24px 0; }
    .footer { text-align: center; font-size: 12px; color: #9E95B7; }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center;"><div class="logo-badge">ASHAKids Citas</div></div>
    <h1>Confirmación de Cita Terapéutica</h1>
    <p>Hola <strong>${params.patientOrTherapistName}</strong>,</p>
    <p>Tu sesión ha sido programada con éxito:</p>
    <div class="details">
      <div class="detail-row"><strong>Sesión:</strong> ${params.topic}</div>
      <div class="detail-row"><strong>Fecha:</strong> ${params.date}</div>
      <div class="detail-row"><strong>Hora:</strong> ${params.time}</div>
    </div>
    ${
      params.zoomJoinUrl
        ? `<a href="${params.zoomJoinUrl}" class="btn">Unirse con ${callPlatform}</a>`
        : ''
    }
    <div class="footer">
      © ${new Date().getFullYear()} ASHAKids • Plataforma de Telerehabilitación
    </div>
  </div>
</body>
</html>`;

    return this.sendMail({
      to: params.to,
      subject: `Confirmación de Cita: ${params.topic}`,
      text,
      html,
    });
  }

  /**
   * Envía correo para restablecimiento de contraseña.
   */
  static async sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
  }): Promise<MailSendResult> {
    const text = `Hola,

Recibimos una solicitud para restablecer tu contraseña en ASHAKids.

Puedes crear una nueva contraseña en el siguiente enlace:
${params.resetUrl}

Si no solicitaste este cambio, puedes ignorar este mensaje; tu cuenta permanece segura.

Equipo ASHAKids
https://ashakids.life`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Nunito', Arial, sans-serif; background-color: #F8F7FC; color: #1C1135; margin: 0; padding: 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid #E8E5F4; }
    .logo-badge { display: inline-block; background: #EDE9FE; color: #6B46FE; font-weight: 900; font-size: 18px; padding: 8px 20px; border-radius: 9999px; }
    h1 { font-size: 20px; font-weight: 800; color: #1C1135; margin: 16px 0; }
    p { font-size: 14px; color: #615274; line-height: 1.6; }
    .btn { display: block; text-align: center; background: #6B46FE; color: #ffffff !important; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 16px; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center;"><div class="logo-badge">ASHAKids</div></div>
    <h1>Restablecer Contraseña</h1>
    <p>Recibimos una solicitud para cambiar tu contraseña de acceso.</p>
    <a href="${params.resetUrl}" class="btn">Crear nueva contraseña</a>
    <p style="font-size: 12px; color: #9E95B7;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
  </div>
</body>
</html>`;

    return this.sendMail({
      to: params.to,
      subject: 'Restablecer contraseña en ASHAKids',
      text,
      html,
    });
  }

  /**
   * Envía correo de confirmación de suscripción al boletín (doble confirmación).
   */
  static async sendNewsletterConfirmation(params: {
    to: string;
    confirmationUrl: string;
    unsubscribeUrl: string;
  }): Promise<MailSendResult> {
    const text = `Confirma tu suscripción al boletín de ASHAKids

Para empezar a recibir recursos educativos, novedades y actividades de estimulación del habla, por favor confirma tu correo en:
${params.confirmationUrl}

Si no deseas recibir estos correos, puedes darte de baja en:
${params.unsubscribeUrl}

Equipo ASHAKids`;

    return this.sendMail({
      to: params.to,
      subject: 'Confirma tu suscripción al boletín de ASHAKids',
      text,
    });
  }
}

