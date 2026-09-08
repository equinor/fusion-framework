import { describe, expect, it } from 'vitest';

import { RequiredAccessRolesError } from '../errors/RequiredAccessRolesError.js';

describe('RequiredAccessRolesError', () => {
  it('recognizes native required-role errors', () => {
    const error = new RequiredAccessRolesError('Missing required roles.', [
      'Reports.Read',
      'Reports.Export',
    ]);

    expect(RequiredAccessRolesError.is(error)).toBe(true);
  });

  it('recognizes required-role errors created in another application bundle', () => {
    const error = {
      type: 'RolesError',
      name: 'RequiredAccessRolesError',
      message: 'Missing required roles.',
      missingAccessRoles: ['Reports.Read'],
    };

    expect(RequiredAccessRolesError.is(error)).toBe(true);
  });

  it('rejects general Roles errors and malformed missing-role collections', () => {
    expect(
      RequiredAccessRolesError.is({
        type: 'RolesError',
        name: 'RolesError',
        message: 'Roles request failed.',
      }),
    ).toBe(false);
    expect(
      RequiredAccessRolesError.is({
        type: 'RolesError',
        name: 'RequiredAccessRolesError',
        message: 'Missing required roles.',
        missingAccessRoles: [42],
      }),
    ).toBe(false);
  });
});
