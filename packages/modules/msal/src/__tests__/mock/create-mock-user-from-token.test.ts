import { describe, expect, it } from 'vitest';

import { createMockToken } from '../../mock/create-mock-token';
import { createMockUserFromToken } from '../../mock/create-mock-user-from-token';

describe('createMockUserFromToken', () => {
  it('maps identity claims onto the matching MsalMockUser fields', () => {
    const token = createMockToken({
      name: 'Ada Lovelace',
      preferred_username: 'ada@equinor.com',
      oid: 'ada-object-id',
      tid: 'ada-tenant-id',
      scp: 'User.Read Files.Read',
    });

    expect(createMockUserFromToken(token)).toEqual({
      name: 'Ada Lovelace',
      username: 'ada@equinor.com',
      userId: 'ada-object-id',
      tenantId: 'ada-tenant-id',
      scopes: ['User.Read', 'Files.Read'],
    });
  });

  it('leaves a field undefined rather than fabricating one, when a claim is absent', () => {
    const token = createMockToken({
      name: undefined,
      preferred_username: undefined,
      scp: undefined,
    });

    const user = createMockUserFromToken(token);

    expect(user.name).toBeUndefined();
    expect(user.username).toBeUndefined();
    expect(user.scopes).toBeUndefined();
  });

  it('throws for a token with no payload segment', () => {
    expect(() => createMockUserFromToken('not-a-jwt')).toThrow(/payload segment/);
  });

  it('throws for an empty string', () => {
    expect(() => createMockUserFromToken('')).toThrow(/payload segment/);
  });
});
