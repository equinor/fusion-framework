import { describe, expect, it } from 'vitest';
import { parseRoleDate } from './parse-role-date';

describe('parseRoleDate', () => {
  it.each([undefined, null, ''])('recognizes absent metadata (%s)', (value) => {
    expect(parseRoleDate(value)).toEqual({ status: 'missing' });
  });

  it.each(['not-a-date', ' ', '2026-02-30T12:00:00Z', '2026-13-01', '2026-09-05T25:00:00Z'])(
    'rejects invalid ISO metadata rather than granting an unlimited expiry (%s)',
    (value) => {
      expect(parseRoleDate(value)).toEqual({ status: 'invalid' });
    },
  );

  it.each([
    '2026-09-05T12:00:00Z',
    '2026-09-05T14:00:00+02:00',
    '2026-09-05T12:00:00',
    '2026-09-05',
    '2024-02-29',
  ])('preserves the instant and existing timezone interpretation (%s)', (value) => {
    expect(parseRoleDate(value)).toEqual({ status: 'valid', timestamp: Date.parse(value) });
  });
});
