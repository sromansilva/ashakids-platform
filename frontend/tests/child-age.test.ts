import { describe, expect, it } from 'vitest';
import { childAge } from '../src/pages/admin/childAge';

describe('child age in Lima', () => {
  it('uses completed years at birthdays and the Lima calendar date', () => {
    const now = new Date('2026-10-12T02:00:00Z'); // October 11 in Lima
    expect(childAge('2020-10-11', now)).toBe(6);
    expect(childAge('2020-10-12', now)).toBe(5);
    expect(childAge('2020-08-26', now)).toBe(6);
  });
  it('handles cleared and impossible dates, future dates and range boundaries', () => {
    const now = new Date('2026-10-11T18:00:00Z');
    expect(childAge('', now)).toBeUndefined();
    expect(childAge('2020-02-30', now)).toBeUndefined();
    expect(childAge('2027-10-11', now)).toBe(-1);
    expect(childAge('2023-10-11', now)).toBe(3);
    expect(childAge('2013-10-12', now)).toBe(12);
    expect(childAge('2013-10-11', now)).toBe(13);
  });
});
