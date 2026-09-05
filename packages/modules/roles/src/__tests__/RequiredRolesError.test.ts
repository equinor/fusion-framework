import { describe, expect, it } from 'vitest';

import { RequiredRolesError } from '../errors/RequiredRolesError.js';

describe('RequiredRolesError', () => {
  it('recognizes native required-role errors', () => {
    const error = new RequiredRolesError('Missing required roles.', [
      'Reports.Read',
      'Reports.Export',
    ]);

    expect(RequiredRolesError.is(error)).toBe(true);
  });

  it('recognizes required-role errors created in another application bundle', () => {
    const error = {
      type: 'RolesError',
      name: 'RequiredRolesError',
      message: 'Missing required roles.',
      missingRoles: ['Reports.Read'],
    };

    expect(RequiredRolesError.is(error)).toBe(true);
  });

  it('rejects general Roles errors and malformed missing-role collections', () => {
    expect(
      RequiredRolesError.is({
        type: 'RolesError',
        name: 'RolesError',
        message: 'Roles request failed.',
      }),
    ).toBe(false);
    expect(
      RequiredRolesError.is({
        type: 'RolesError',
        name: 'RequiredRolesError',
        message: 'Missing required roles.',
        missingRoles: [42],
      }),
    ).toBe(false);
  });
});
