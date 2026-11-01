import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GoogleCalendarService, buildCalendarEventPayload } from '../../backend/dist/infrastructure/calendar/google-calendar.service.js';

describe('Google Calendar appointment events', () => {
  it('creates a normal calendar event without requesting a video conference', () => {
    const event = buildCalendarEventPayload({
      topic: 'AshaKids · Sesión de terapia',
      startTime: '2026-10-31T11:00:00Z',
      durationMinutes: 40,
    });

    assert.equal(event.summary, 'AshaKids · Sesión de terapia');
    assert.equal(event.start.dateTime, '2026-10-31T11:00:00.000Z');
    assert.equal(event.end.dateTime, '2026-10-31T11:40:00.000Z');
    assert.equal('conferenceData' in event, false);
  });

  it('reports whether Calendar is configured without making an external request', () => {
    assert.equal(typeof GoogleCalendarService.isConfigured(), 'boolean');
  });

  it('adds an existing Meet URL as an external link without requesting Meet conferencing', () => {
    const event = buildCalendarEventPayload({
      topic: 'AshaKids · Sesión virtual',
      startTime: '2026-10-31T11:00:00Z',
      durationMinutes: 40,
      meetUrl: 'https://meet.google.com/abc-defg-hij',
    });

    assert.match(event.description, /https:\/\/meet\.google\.com\/abc-defg-hij/);
    assert.equal('conferenceData' in event, false);
  });

  it('does not copy unrelated URLs into the Calendar description', () => {
    const event = buildCalendarEventPayload({
      topic: 'AshaKids · Sesión virtual',
      startTime: '2026-10-31T11:00:00Z',
      meetUrl: 'https://example.invalid/session/123',
    });

    assert.doesNotMatch(event.description, /example\.invalid/);
  });
});
