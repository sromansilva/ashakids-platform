import { settings } from '../../core/config.js';
import { GmailService } from '../mailer/gmail.service.js';
import { isGoogleMeetUrl as isMeetingUrl } from '../../core/security/google-meet-url.js';

export interface CalendarEventResult {
  id: string;
  htmlLink?: string;
}

export function buildCalendarEventPayload(params: {
  topic: string;
  startTime: string;
  durationMinutes?: number;
  meetUrl?: string | null;
}) {
  const start = new Date(params.startTime);
  if (Number.isNaN(start.getTime())) throw new Error('La fecha de la cita no es válida para Google Calendar.');
  const end = new Date(start.getTime() + (params.durationMinutes || 40) * 60_000);
  const meetLink = isMeetingUrl(params.meetUrl) ? `\nEnlace de videoconsulta (Google Meet): ${params.meetUrl}` : '';
  return {
    summary: params.topic || 'AshaKids · Sesión terapéutica',
    description: `Cita programada desde AshaKids.${meetLink}`,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
}

/** Creates a calendar appointment only. It never requests a video conference. */
export class GoogleCalendarService {
  static isConfigured(): boolean {
    return Boolean(settings.GOOGLE_CALENDAR_ENABLED) && GmailService.isConfigured();
  }

  static async createAppointmentEvent(params: {
    topic: string;
    startTime: string;
    durationMinutes?: number;
    meetUrl?: string | null;
  }): Promise<CalendarEventResult | null> {
    if (!this.isConfigured()) return null;

    const token = await GmailService.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCalendarEventPayload(params)),
      });

      if (!response.ok) {
        const detail = await response.text();
        console.warn('[GoogleCalendarService] No se pudo crear el evento:', response.status, detail);
        return null;
      }

      const data = await response.json() as { id?: string; htmlLink?: string };
      return data.id ? { id: data.id, htmlLink: data.htmlLink } : null;
    } catch (error) {
      console.warn('[GoogleCalendarService] Error creando el evento:', error);
      return null;
    }
  }

  static async updateAppointmentEvent(eventId: string, params: {
    topic: string;
    startTime: string;
    durationMinutes?: number;
    meetUrl?: string | null;
  }): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const token = await GmailService.getAccessToken();
    if (!token) return false;
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(eventId) + '?conferenceDataVersion=1',
        {
          method: 'PATCH',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify(buildCalendarEventPayload(params)),
        },
      );
      if (!response.ok) {
        console.warn('[GoogleCalendarService] No se pudo actualizar el evento:', response.status, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.warn('[GoogleCalendarService] Error actualizando el evento:', error);
      return false;
    }
  }

  static async cancelAppointmentEvent(eventId: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const token = await GmailService.getAccessToken();
    if (!token) return false;
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(eventId),
        { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } },
      );
      return response.ok || response.status === 404 || response.status === 410;
    } catch (error) {
      console.warn('[GoogleCalendarService] Error cancelando el evento:', error);
      return false;
    }
  }
}

export { isMeetingUrl };
