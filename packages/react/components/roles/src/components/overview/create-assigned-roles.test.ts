import { describe, expect, it } from 'vitest';
import type { ConsolidatedRoleAssignments } from '../../state/roles-state';
import { createAssignedRoles } from './create-assigned-roles';

describe('createAssignedRoles', () => {
  it('normalizes assigned assignments without treating validity as claim activation', () => {
    const roles: ConsolidatedRoleAssignments = [
      {
        id: 'assigned-role',
        role: { name: 'reports-admin', displayName: 'Reports admin' },
        validTo: '2027-01-01T00:00:00Z',
      },
    ];

    expect(createAssignedRoles(roles)).toEqual([
      expect.objectContaining({
        key: 'assigned:assigned-role',
        displayName: 'Reports admin',
        name: 'reports-admin',
        isActive: true,
        activeTo: null,
        validTo: '2027-01-01T00:00:00Z',
      }),
    ]);
  });

  it('keeps duplicate assignments without identifiers distinct and applies display defaults', () => {
    const roles: ConsolidatedRoleAssignments = [{}, {}];

    const normalized = createAssignedRoles(roles);

    expect(normalized).toHaveLength(2);
    // Duplicate source rows must retain distinct render identities.
    expect(new Set(normalized.map((role) => role.key)).size).toBe(2);
    expect(normalized[0]).toMatchObject({
      displayName: 'Unknown role',
      name: 'Unknown role',
      description: 'No description is available.',
    });
  });
});
