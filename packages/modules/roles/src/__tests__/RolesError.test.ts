import { describe, expect, it } from 'vitest';

import { ClaimRoleError } from '../errors/ClaimRoleError.js';
import { RequiredRolesError } from '../errors/RequiredRolesError.js';
import { RolesError } from '../errors/RolesError.js';

describe('RolesError', () => {
  class ForeignRuntimeRolesError extends Error {
    public readonly type = 'RolesError' as const;
  }

  it('identifies general and specialized Roles errors', () => {
    expect(RolesError.is(new RolesError('general failure'))).toBe(true);
    expect(RolesError.is(new RequiredRolesError('missing role', ['Reports.Read']))).toBe(true);
    expect(RolesError.is(new ClaimRoleError('claim failure'))).toBe(true);
  });

  it('identifies Roles errors created by another runtime scope', () => {
    const error = new ForeignRuntimeRolesError('remote failure');

    expect(error).not.toBeInstanceOf(RolesError);
    expect(RolesError.is(error)).toBe(true);
  });

  it('rejects unrelated thrown values', () => {
    expect(RolesError.is(new Error('unrelated'))).toBe(false);
    expect(RolesError.is({ type: 'OtherError' })).toBe(false);
    expect(RolesError.is({ type: RolesError.Type })).toBe(false);
    expect(RolesError.is('unrelated')).toBe(false);
    expect(RolesError.is(undefined)).toBe(false);
  });

  it('preserves causes and specialized error data', () => {
    const cause = new Error('service failed');
    const claimError = new ClaimRoleError('claim failure', { cause });
    const requiredError = new RequiredRolesError('missing role', ['Reports.Read']);

    expect(claimError.cause).toBe(cause);
    expect(claimError.name).toBe('ClaimRoleError');
    expect(requiredError.missingRoles).toEqual(['Reports.Read']);
    expect(requiredError.name).toBe('RequiredRolesError');
  });
});
