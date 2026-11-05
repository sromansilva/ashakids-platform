import { Router, type NextFunction, type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { settings } from '../../core/config.js';
import { handleIncomingMessage, type IncomingMessage } from './whatsapp.conversation.js';

export const whatsappRouter = Router();

function safeEqual(a: string, b: string): boolean {
  const left = createHmac('sha256', 'cmp').update(a).digest();
  const right = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(left, right);
}

/** Valida X-Hub-Signature-256 sobre el cuerpo crudo. Falla cerrado ante cualquier duda. */
export function verifyMetaSignature(rawBody: Buffer, header: string | undefined, secret: string): boolean {
  if (!secret || !header || !header.startsWith('sha256=')) return false;
  const provided = header.slice('sha256='.length);
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(provided, 'hex'));
}

function requireEnabled(_req: Request, res: Response, next: NextFunction) {
  if (!settings.WHATSAPP_ENABLED) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }
  next();
}

whatsappRouter.use('/webhook', requireEnabled);

// Verificación del webhook por Meta.
whatsappRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = settings.WHATSAPP_VERIFY_TOKEN;
  if (
    mode === 'subscribe' &&
    expected &&
    typeof token === 'string' &&
    typeof challenge === 'string' &&
    safeEqual(token, expected)
  ) {
    res.status(200).type('text/plain').send(challenge);
    return;
  }
  res.sendStatus(403);
});

interface MetaMessage {
  id?: unknown;
  from?: unknown;
  type?: unknown;
  text?: { body?: unknown };
}
interface MetaPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { metadata?: { phone_number_id?: unknown }; messages?: MetaMessage[]; statuses?: unknown };
    }>;
  }>;
}

/** Extrae los mensajes entrantes de un payload de Meta; ignora `statuses` y números ajenos. */
export function extractIncomingMessages(payload: unknown): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  const entries = (payload as MetaPayload | null)?.entry;
  if (!Array.isArray(entries)) return out;
  for (const entry of entries) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      const value = change?.value;
      if (!value || !Array.isArray(value.messages)) continue;
      const phoneId = value.metadata?.phone_number_id;
      if (settings.WHATSAPP_PHONE_NUMBER_ID && typeof phoneId === 'string' && phoneId !== settings.WHATSAPP_PHONE_NUMBER_ID) {
        continue;
      }
      for (const m of value.messages) {
        if (typeof m?.id !== 'string' || typeof m.from !== 'string' || !/^\d{6,20}$/.test(m.from)) continue;
        const body = m.type === 'text' && typeof m.text?.body === 'string' ? m.text.body.slice(0, 500) : null;
        out.push({ wamid: m.id.slice(0, 255), from: m.from, text: body });
      }
    }
  }
  return out;
}

async function processPayload(payload: unknown): Promise<void> {
  for (const message of extractIncomingMessages(payload)) {
    await handleIncomingMessage(message);
  }
}

// El cuerpo llega crudo (express.raw montado en app.ts antes de express.json).
whatsappRouter.post('/webhook', (req: Request, res: Response) => {
  const raw = req.body;
  const signature = req.header('x-hub-signature-256');
  if (!Buffer.isBuffer(raw) || !verifyMetaSignature(raw, signature, settings.WHATSAPP_APP_SECRET)) {
    res.sendStatus(401);
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    // Firma válida pero cuerpo ilegible: se confirma para que Meta no reintente.
    res.sendStatus(200);
    return;
  }

  // Responder rápido; el procesamiento ocurre después y nunca registra datos personales.
  res.sendStatus(200);
  void processPayload(payload).catch(() => {
    console.error('[WhatsApp] Error procesando el evento del webhook');
  });
});
