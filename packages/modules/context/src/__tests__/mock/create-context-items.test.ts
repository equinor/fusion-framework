import { describe, expect, it } from 'vitest';

import { createContextItems } from '../../mock/fixtures';

describe('createContextItems', () => {
  it('generates one item per type by default, with deterministic ids', () => {
    const [project] = createContextItems([{ type: 'ProjectMaster' }]);

    expect(project.id).toBe('projectmaster-1');
    expect(project.type).toEqual({ id: 'ProjectMaster' });
  });

  it('generates `count` items per type, numbered from 1', () => {
    const items = createContextItems([{ type: 'Facility', count: 3 }]);

    // compare ids only, to assert the sequence without repeating every field
    expect(items.map((item) => item.id)).toEqual(['facility-1', 'facility-2', 'facility-3']);
  });

  it('generates items for several types in the order given', () => {
    const items = createContextItems([{ type: 'ProjectMaster' }, { type: 'Facility', count: 2 }]);

    // compare ids only, to assert both type and generation order together
    expect(items.map((item) => item.id)).toEqual(['projectmaster-1', 'facility-1', 'facility-2']);
  });

  it('marks a type as a child type when parentTypeIds is given', () => {
    const [facility] = createContextItems([{ type: 'Facility', parentTypeIds: ['ProjectMaster'] }]);

    expect(facility.type).toEqual({
      id: 'Facility',
      isChildType: true,
      parentTypeIds: ['ProjectMaster'],
    });
  });

  it('applies per-item overrides by 1-based index', () => {
    const items = createContextItems([
      {
        type: 'Facility',
        count: 2,
        item: (index) => ({ title: `Facility ${index}` }),
      },
    ]);

    // compare titles only, to assert the override was applied per index
    expect(items.map((item) => item.title)).toEqual(['Facility 1', 'Facility 2']);
  });

  it('fills in a deterministic default title from a faker instance seeded by the item id', () => {
    const [a] = createContextItems([{ type: 'ProjectMaster' }]);
    const [b] = createContextItems([{ type: 'ProjectMaster' }]);

    // same id ('projectmaster-1') in both calls must produce the same title
    expect(a.title).toEqual(b.title);
    expect(a.title).toEqual(expect.any(String));
  });
});
