export function safeGoogleMeetUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'meet.google.com' || url.port || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function isGoogleMeetUrl(value: unknown): value is string {
  return safeGoogleMeetUrl(value) !== null;
}
