import { describe, expect, it } from 'vitest';
import type { ActiveRoles } from '../../state/roles-state';
import { createActiveRoleItems } from './create-active-role-items';

describe('createActiveRoleItems', () => {
  it('includes every scope field and preserves duplicate and missing-metadata rows', () => {
    const roles: ActiveRoles = [
      { scope: { type: 'project', isGlobal: false, values: ['A', 'B'] } },
      { scope: { type: 'contract', isGlobal: false, values: ['A', 'B'] } },
      { scope: { type: 'project', isGlobal: true, values: ['A', 'B'] } },
      { scope: { type: 'project', isGlobal: false, values: ['A,B'] } },
      { scope: { type: 'project', isGlobal: false, values: null } },
      {},
      {},
    ];
    const items = createActiveRoleItems(roles);
    // Every visible row needs a unique identity, even when optional metadata is absent.
    expect(new Set(items.map((item) => item.key)).size).toBe(roles.length);
    // Key generation must preserve the assignments and their display order.
    expect(items.map((item) => item.assignment)).toEqual(roles);
    expect(createActiveRoleItems([])).toEqual([]);
  });

  it('retains keys across unrelated insertions, removals and reordering', () => {
    const first = { scope: { type: 'project', isGlobal: false, values: ['A'] } };
    const second = { scope: { type: 'project', isGlobal: false, values: ['B'] } };
    // Capture identities before modifying unrelated rows or moving the second scope.
    const keys = createActiveRoleItems([first, second, first]).map((item) => item.key);
    const changed = createActiveRoleItems([{}, second, first, first]);
    // Ignore the inserted row while comparing the original scope and duplicate identities.
    expect(changed.slice(1).map((item) => item.key)).toEqual([keys[1], keys[0], keys[2]]);
    expect(createActiveRoleItems([second])[0].key).toBe(keys[1]);
  });

  it('avoids delimiter collisions and ignores scope object property insertion order', () => {
    const roles = [
      { systemName: 'A:B', accessRoleName: 'C' },
      { systemName: 'A', accessRoleName: 'B:C' },
    ];
    // These names collide under colon interpolation but represent different assignments.
    expect(new Set(createActiveRoleItems(roles).map((item) => item.key)).size).toBe(2);
    const first = { scope: { type: 'project', isGlobal: false, values: ['A'] } };
    const reordered = { scope: { values: ['A'], isGlobal: false, type: 'project' } };
    expect(createActiveRoleItems([first])[0].key).toBe(createActiveRoleItems([reordered])[0].key);
  });
});
