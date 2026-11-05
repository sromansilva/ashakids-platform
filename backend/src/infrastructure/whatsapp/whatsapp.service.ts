import { settings } from '../../core/config.js';

export type WhatsAppSendStatus = 'ENVIADO' | 'NO_CONFIGURADO' | 'ERROR';

export interface WhatsAppSendResult {
  success: boolean;
  status: WhatsAppSendStatus;
  messageId?: string;
}

const REQUEST_TIMEOUT_MS = 10_000;

export class WhatsAppService {
  static isConfigured(): boolean {
    return (
      Boolean(settings.WHATSAPP_ENABLED) &&
      Boolean(settings.WHATSAPP_ACCESS_TOKEN) &&
      Boolean(settings.WHATSAPP_PHONE_NUMBER_ID)
    );
  }

  private static async post(payload: Record<string, unknown>): Promise<WhatsAppSendResult> {
    if (!this.isConfigured()) return { success: false, status: 'NO_CONFIGURADO' };

    const url = `https://graph.facebook.com/${settings.WHATSAPP_API_VERSION}/${settings.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', ...payload }),
        signal: controller.signal,
      });
      if (!res.ok) {
        // Solo el código HTTP: el cuerpo de la respuesta podría reflejar datos del destinatario.
        console.error(`[WhatsAppService] Meta respondió HTTP ${res.status}`);
        return { success: false, status: 'ERROR' };
      }
      const data = (await res.json().catch(() => null)) as { messages?: Array<{ id?: string }> } | null;
      return { success: true, status: 'ENVIADO', messageId: data?.messages?.[0]?.id };
    } catch (err) {
      console.error('[WhatsAppService] Fallo de red o tiempo de espera:', err instanceof Error ? err.name : 'desconocido');
      return { success: false, status: 'ERROR' };
    } finally {
      clearTimeout(timer);
    }
  }

  static sendText(to: string, body: string): Promise<WhatsAppSendResult> {
    return this.post({ to, type: 'text', text: { preview_url: false, body } });
  }

  static sendTemplate(to: string, name: string, lang: string, params: string[] = []): Promise<WhatsAppSendResult> {
    return this.post({
      to,
      type: 'template',
      template: {
        name,
        language: { code: lang },
        ...(params.length
          ? { components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] }
          : {}),
      },
    });
  }
}
