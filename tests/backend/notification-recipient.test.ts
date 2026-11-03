import assert from 'node:assert/strict';
import test from 'node:test';
import { isReminderRecipientEnabled } from '../../backend/src/modules/notificaciones/notification-recipient.ts';

test('T-10 follows the therapist notification preference independently of the family setting', () => {
  assert.equal(isReminderRecipientEnabled(10, { parent_recordatorio: false, therapist_recordatorio: true }), true);
  assert.equal(isReminderRecipientEnabled(10, { parent_recordatorio: true, therapist_recordatorio: false }), false);
});

test('T-5 follows the family preference independently of the therapist setting', () => {
  assert.equal(isReminderRecipientEnabled(5, { parent_recordatorio: true, therapist_recordatorio: false }), true);
  assert.equal(isReminderRecipientEnabled(5, { parent_recordatorio: false, therapist_recordatorio: true }), false);
});
