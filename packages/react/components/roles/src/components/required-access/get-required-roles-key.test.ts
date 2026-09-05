import { describe, expect, it } from 'vitest';
import { getRequiredRolesKey } from './get-required-roles-key';

describe('getRequiredRolesKey', () => {
  it('matches provider normalization without depending on order or duplicates', () => {
    expect(getRequiredRolesKey([' Reports.Read ', '', 'Reports.Export', 'Reports.Read'])).toBe(
      getRequiredRolesKey(['Reports.Export', 'Reports.Read']),
    );
    expect(getRequiredRolesKey([' ', ''])).toBe(getRequiredRolesKey([]));
  });

  it('preserves case-sensitive differences and cannot collide on embedded delimiters', () => {
    expect(getRequiredRolesKey(['Reports.Read'])).not.toBe(getRequiredRolesKey(['reports.read']));
    expect(getRequiredRolesKey(['Reports.Read\u0000Reports.Export'])).not.toBe(
      getRequiredRolesKey(['Reports.Read', 'Reports.Export']),
    );
  });
});
