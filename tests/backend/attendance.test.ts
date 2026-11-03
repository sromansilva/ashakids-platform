import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isAttendedOrActiveSession, normalizeAttendance } from '../../backend/src/modules/sesiones/attendance.ts';

describe('session attendance contract', () => {
  it('normalizes current and legacy attendance values', () => {
    for (const value of ['ASISTIO', 'true', 'TRUE', 't', '1', true]) {
      assert.equal(normalizeAttendance(value), 'ASISTIO');
    }
    for (const value of ['NO_ASISTIO', 'false', 'FALSE', 'f', '0', false]) {
      assert.equal(normalizeAttendance(value), 'NO_ASISTIO');
    }
    assert.equal(normalizeAttendance(null), null);
    assert.equal(normalizeAttendance('pendiente'), null);
  });

  it('allows active sessions and attended completed sessions only', () => {
    assert.equal(isAttendedOrActiveSession('EN_CURSO', null), true);
    assert.equal(isAttendedOrActiveSession('EN_CURSO', 'NO_ASISTIO'), false);
    assert.equal(isAttendedOrActiveSession('FINALIZADA', 'ASISTIO'), true);
    assert.equal(isAttendedOrActiveSession('FINALIZADA', 'true'), true);
    assert.equal(isAttendedOrActiveSession('FINALIZADA', 'NO_ASISTIO'), false);
    assert.equal(isAttendedOrActiveSession('FINALIZADA', null), false);
    assert.equal(isAttendedOrActiveSession('PROGRAMADA', null), false);
  });
});
