import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MeetService } from '../../backend/dist/infrastructure/meet/meet.service.js';

describe('Google Meet & Calendar Integration Tests (TypeScript)', () => {
  it('1. Detects configuration mode gracefully without throwing exceptions', () => {
    const configured = MeetService.isConfigured();
    assert.equal(typeof configured, 'boolean');
  });

  it('2. Handles createMeeting safely without throwing unhandled exceptions', async () => {
    const result = await MeetService.createMeeting({
      topic: 'Prueba de Cita Google Meet',
      startTime: '2026-10-31T11:00:00Z',
      durationMinutes: 40,
    });

    // In local dev without Google OAuth configured, must return null safely
    if (result !== null) {
      assert.equal(typeof result, 'object');
      assert.ok(result.join_url);
      assert.ok(result.join_url.includes('meet.google.com') || result.join_url.startsWith('https://'));
    } else {
      assert.equal(result, null);
    }
  });
});

