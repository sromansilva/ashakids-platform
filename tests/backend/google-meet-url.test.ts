import assert from 'node:assert/strict';
import test from 'node:test';
import { isGoogleMeetUrl, safeGoogleMeetUrl } from '../../backend/src/core/security/google-meet-url.ts';

test('only accepts secure Google Meet links without credentials or custom ports', () => {
  assert.equal(isGoogleMeetUrl('https://meet.google.com/abc-defg-hij'), true);
  assert.equal(safeGoogleMeetUrl('https://meet.google.com/abc-defg-hij'), 'https://meet.google.com/abc-defg-hij');
  assert.equal(isGoogleMeetUrl('https://meet.google.com.evil.example/abc'), false);
  assert.equal(isGoogleMeetUrl('https://example.com/meeting'), false);
  assert.equal(isGoogleMeetUrl('https://user:pass@meet.google.com/abc'), false);
  assert.equal(isGoogleMeetUrl('https://meet.google.com:8443/abc'), false);
  assert.equal(isGoogleMeetUrl('http://meet.google.com/abc'), false);
});
