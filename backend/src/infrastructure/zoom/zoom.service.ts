import { settings } from '../../core/config.js';

export interface ZoomMeetingResult {
  id: string;
  join_url: string;
  start_url: string;
  password?: string;
}

export class ZoomService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  static isConfigured(): boolean {
    return (
      settings.ZOOM_ENABLED &&
      Boolean(settings.ZOOM_ACCOUNT_ID) &&
      Boolean(settings.ZOOM_CLIENT_ID) &&
      Boolean(settings.ZOOM_CLIENT_SECRET) &&
      Boolean(settings.ZOOM_HOST_USER_ID)
    );
  }

  static async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    try {
      const creds = Buffer.from(`${settings.ZOOM_CLIENT_ID}:${settings.ZOOM_CLIENT_SECRET}`).toString('base64');
      const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(
        settings.ZOOM_ACCOUNT_ID
      )}`;

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[ZoomService] Error obtaining OAuth token:', res.status, errText);
        return null;
      }

      const data = (await res.json()) as any;
      if (!data.access_token) return null;

      this.cachedToken = {
        token: data.access_token,
        expiresAt: now + (data.expires_in ?? 3600) * 1000,
      };
      return data.access_token;
    } catch (err) {
      console.error('[ZoomService] Exception getting Zoom access token:', err);
      return null;
    }
  }

  static async createMeeting(params: {
    topic: string;
    startTime: string;
    durationMinutes?: number;
  }): Promise<ZoomMeetingResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const url = `${settings.ZOOM_API_BASE_URL.replace(/\/+$/, '')}/users/${encodeURIComponent(
        settings.ZOOM_HOST_USER_ID
      )}/meetings`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: params.topic,
          type: 2,
          start_time: params.startTime,
          duration: params.durationMinutes || settings.ZOOM_MEETING_DURATION_MINUTES,
          timezone: 'America/Lima',
          settings: {
            waiting_room: true,
            join_before_host: false,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[ZoomService] Error creating Zoom meeting:', res.status, errText);
        return null;
      }

      const data = (await res.json()) as any;
      return {
        id: String(data.id),
        join_url: data.join_url,
        start_url: data.start_url,
        password: data.password,
      };
    } catch (err) {
      console.error('[ZoomService] Exception creating meeting:', err);
      return null;
    }
  }
}

