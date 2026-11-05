import { z } from 'zod';

/**
 * Máquina de estados PURA del chatbot de solicitud de acceso familiar.
 * No toca BD, red ni reloj global: todo entra por parámetros y sale en el resultado.
 * El bot solo recoge una solicitud; nunca crea cuentas.
 */

export type BotState =
  | 'INICIO'
  | 'CONSENTIMIENTO'
  | 'NOMBRES'
  | 'APELLIDOS'
  | 'DNI'
  | 'CORREO'
  | 'CONFIRMAR'
  | 'FINALIZADA';

export interface BotDraft {
  consentimiento_en?: string;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  email?: string;
}

export interface SolicitudDraft {
  consentimiento_en: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
}

export interface BotInput {
  state: BotState;
  data: BotDraft;
  /** Texto del mensaje, o null si no es de tipo texto (imagen, audio, etc.). */
  text: string | null;
  now: Date;
  /** Último mensaje previo de la conversación, para el reinicio por inactividad. */
  lastMessageAt: Date | null;
}

export interface BotOutput {
  state: BotState;
  data: BotDraft;
  reply: string;
  crearSolicitud: boolean;
  solicitud: SolicitudDraft | null;
}

export const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000;

const emailSchema = z.string().email().max(150);

export const MSG = {
  bienvenida:
    '¡Hola! Soy el asistente de Ashakids 💜. Aquí puedes pedir acceso para tu familia.\n\n' +
    'Aviso de privacidad: usaremos tus datos (nombres, apellidos, DNI, correo y este número) solo para ' +
    'revisar tu solicitud y, si se aprueba, crear tu cuenta. Puedes escribir CANCELAR para borrarlos mientras tu solicitud no se haya aprobado.\n\n' +
    'Para continuar, responde SI.',
  pedirConsentimiento: 'Para continuar necesito tu aceptación. Responde SI para seguir o CANCELAR para salir.',
  pedirNombres: 'Gracias. ¿Cuáles son tus nombres? (máximo 60 caracteres)',
  nombresInvalidos: 'No pude leer tus nombres. Escríbelos en un solo mensaje, con hasta 60 caracteres.',
  pedirApellidos: 'Perfecto. Ahora, ¿cuáles son tus apellidos? (máximo 80 caracteres)',
  apellidosInvalidos: 'No pude leer tus apellidos. Escríbelos en un solo mensaje, con hasta 80 caracteres.',
  pedirDni: 'Gracias. ¿Cuál es tu DNI? Son 8 números, sin espacios ni guiones.',
  dniInvalido: 'El DNI debe tener exactamente 8 números. Inténtalo de nuevo, por favor.',
  pedirCorreo: 'Casi listo. ¿A qué correo electrónico te enviamos el enlace de activación?',
  correoInvalido: 'Ese correo no parece válido. Revisa que tenga el formato nombre@dominio.com e inténtalo de nuevo.',
  soloTexto: 'Por ahora solo puedo leer mensajes de texto. ¿Me respondes escribiendo, por favor?',
  cancelado: 'Listo, cancelé la solicitud y borré los datos que me diste. Cuando quieras empezar de nuevo, escríbeme.',
  finalizada:
    '¡Gracias! Tu solicitud quedó en revisión. Nuestro equipo la revisará y, si se aprueba, recibirás un correo ' +
    'con el enlace para activar tu cuenta.',
  enRevision: 'Tu solicitud sigue en revisión. Te avisaremos cuando tengamos novedades. ¡Gracias por tu paciencia!',
  aprobada:
    'Tu solicitud ya fue aprobada. Revisa el correo que registraste (también la carpeta de spam) o ingresa al portal de Ashakids.',
  confirmarAyuda: 'Responde SI para enviar tu solicitud o CORREGIR para volver a empezar con tus datos.',
} as const;

export function resumen(draft: BotDraft): string {
  return (
    'Revisa tus datos:\n' +
    `• Nombres: ${draft.nombres}\n` +
    `• Apellidos: ${draft.apellidos}\n` +
    `• DNI: ${draft.dni}\n` +
    `• Correo: ${draft.email}\n\n` +
    'Responde SI para enviar tu solicitud o CORREGIR para empezar de nuevo.'
  );
}

/** Mayúsculas, sin tildes ni signos, espacios colapsados: para reconocer comandos. */
export function normalizeCommand(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function cleanLine(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function result(state: BotState, data: BotDraft, reply: string): BotOutput {
  return { state, data, reply, crearSolicitud: false, solicitud: null };
}

export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.trim().toLowerCase().split('@');
  if (!domain) return '***';
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function processMessage(input: BotInput): BotOutput {
  let { state, data } = input;

  // Inactividad > 24 h: se reinicia la conversación y se descarta el borrador.
  if (input.lastMessageAt && input.now.getTime() - input.lastMessageAt.getTime() > INACTIVITY_LIMIT_MS) {
    state = 'INICIO';
    data = {};
  }

  if (input.text === null) return result(state, data, MSG.soloTexto);

  const raw = cleanLine(input.text);
  const command = normalizeCommand(raw);

  if (command === 'CANCELAR') return result('INICIO', {}, MSG.cancelado);

  switch (state) {
    case 'INICIO':
    case 'FINALIZADA':
      return result('CONSENTIMIENTO', {}, MSG.bienvenida);

    case 'CONSENTIMIENTO':
      if (command === 'SI') {
        return result('NOMBRES', { consentimiento_en: input.now.toISOString() }, MSG.pedirNombres);
      }
      return result('CONSENTIMIENTO', data, MSG.pedirConsentimiento);

    case 'NOMBRES':
      if (raw.length < 1 || raw.length > 60) return result(state, data, MSG.nombresInvalidos);
      return result('APELLIDOS', { ...data, nombres: raw }, MSG.pedirApellidos);

    case 'APELLIDOS':
      if (raw.length < 1 || raw.length > 80) return result(state, data, MSG.apellidosInvalidos);
      return result('DNI', { ...data, apellidos: raw }, MSG.pedirDni);

    case 'DNI': {
      const dni = raw.replace(/\s+/g, '');
      if (!/^\d{8}$/.test(dni)) return result(state, data, MSG.dniInvalido);
      return result('CORREO', { ...data, dni }, MSG.pedirCorreo);
    }

    case 'CORREO': {
      const email = raw.toLowerCase();
      if (!emailSchema.safeParse(email).success) return result(state, data, MSG.correoInvalido);
      const next = { ...data, email };
      return result('CONFIRMAR', next, resumen(next));
    }

    case 'CONFIRMAR': {
      if (command === 'CORREGIR') {
        const kept: BotDraft = data.consentimiento_en ? { consentimiento_en: data.consentimiento_en } : {};
        return result('NOMBRES', kept, MSG.pedirNombres);
      }
      if (command === 'SI') {
        if (!data.nombres || !data.apellidos || !data.dni || !data.email || !data.consentimiento_en) {
          // Borrador incompleto (estado corrupto): se vuelve a pedir desde el inicio.
          return result('NOMBRES', {}, MSG.pedirNombres);
        }
        const solicitud: SolicitudDraft = {
          consentimiento_en: data.consentimiento_en,
          nombres: data.nombres,
          apellidos: data.apellidos,
          dni: data.dni,
          email: data.email,
        };
        return { state: 'FINALIZADA', data: {}, reply: MSG.finalizada, crearSolicitud: true, solicitud };
      }
      return result(state, data, `${MSG.confirmarAyuda}\n\n${resumen(data)}`);
    }

    default:
      return result('CONSENTIMIENTO', {}, MSG.bienvenida);
  }
}
