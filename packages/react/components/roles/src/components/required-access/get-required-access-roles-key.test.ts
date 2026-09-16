import { describe, expect, it } from 'vitest';
import { getRequiredAccessRolesKey } from './get-required-access-roles-key';

describe('getRequiredAccessRolesKey', () => {
  it('matches provider normalization without depending on order or duplicates', () => {
    expect(
      getRequiredAccessRolesKey([' Reports.Read ', '', 'Reports.Export', 'Reports.Read']),
    ).toBe(getRequiredAccessRolesKey(['Reports.Export', 'Reports.Read']));
    expect(getRequiredAccessRolesKey([' ', ''])).toBe(getRequiredAccessRolesKey([]));
  });

  it('preserves case-sensitive differences and cannot collide on embedded delimiters', () => {
    expect(getRequiredAccessRolesKey(['Reports.Read'])).not.toBe(
      getRequiredAccessRolesKey(['reports.read']),
    );
    expect(getRequiredAccessRolesKey(['Reports.Read\u0000Reports.Export'])).not.toBe(
      getRequiredAccessRolesKey(['Reports.Read', 'Reports.Export']),
    );
  });
});
