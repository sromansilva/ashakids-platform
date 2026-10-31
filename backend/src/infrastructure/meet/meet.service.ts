import { settings } from '../../core/config.js';
import { GmailService } from '../mailer/gmail.service.js';

export interface MeetMeetingResult {
  id: string;
  join_url: string;
  start_url: string;
}

export class MeetService {
  /**
   * Determina si la integración con Google Meet / Calendar está disponible.
   * Utiliza el mismo cliente OAuth y Refresh Token configurado para Google / Gmail.
   */
  static isConfigured(): boolean {
    return (
      Boolean(settings.MEET_ENABLED) &&
      GmailService.isConfigured()
    );
  }

  /**
   * Crea una reunión en Google Meet usando la API de Google Calendar con conferenceDataVersion=1.
   * Devuelve el enlace permanente de Google Meet (ej. https://meet.google.com/xxx-yyyy-zzz).
   */
  static async createMeeting(params: {
    topic: string;
    startTime: string;
    durationMinutes?: number;
  }): Promise<MeetMeetingResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const token = await GmailService.getAccessToken();
      if (!token) return null;

      const duration = params.durationMinutes || 40;
      const startDate = new Date(params.startTime);
      const startIso = !isNaN(startDate.getTime()) ? startDate.toISOString() : new Date().toISOString();
      const endIso = new Date(new Date(startIso).getTime() + duration * 60000).toISOString();
      const requestId = `ashakids-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: params.topic || 'AshaKids · Sesión Terapéutica',
          description: 'Sesión terapéutica en la plataforma Ashakids • https://ashakids.life',
          start: { dateTime: startIso },
          end: { dateTime: endIso },
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('[MeetService] Google Calendar API error:', res.status, errText);
        return null;
      }

      const data = (await res.json()) as {
        id?: string;
        hangoutLink?: string;
        conferenceData?: {
          entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
        };
      };

      const meetUrl =
        data.hangoutLink ||
        data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri;

      if (!meetUrl) return null;

      return {
        id: data.id || requestId,
        join_url: meetUrl,
        start_url: meetUrl,
      };
    } catch (err) {
      console.warn('[MeetService] Excepción creando reunión en Google Meet:', err);
      return null;
    }
  }
}

