import { describe, expect, it } from 'vitest';

import { createContextItemFactory } from '../../mock/fixtures';

describe('createContextItemFactory', () => {
  it('generates sequential, deterministic ids across calls', () => {
    const createContextItem = createContextItemFactory();

    expect(createContextItem().id).toBe('ctx-1');
    expect(createContextItem().id).toBe('ctx-2');
    expect(createContextItem().id).toBe('ctx-3');
  });

  it('scopes the sequence to the returned factory, not globally', () => {
    const a = createContextItemFactory();
    const b = createContextItemFactory();

    a();
    a();

    // b starts counting from 1 regardless of how many items a() already created
    expect(b().id).toBe('ctx-1');
  });

  it('uses the given prefix', () => {
    const createContextItem = createContextItemFactory('project');

    expect(createContextItem().id).toBe('project-1');
  });

  it('applies overrides on top of the defaults', () => {
    const createContextItem = createContextItemFactory();

    const item = createContextItem({ title: 'Project 42', type: { id: 'ProjectMaster' } });

    expect(item.title).toBe('Project 42');
    expect(item.type).toEqual({ id: 'ProjectMaster' });
    expect(item.value).toEqual({});
  });

  it('lets an explicit id override the generator without breaking the sequence', () => {
    const createContextItem = createContextItemFactory();

    const first = createContextItem({ id: 'explicit-id' });
    const second = createContextItem();

    expect(first.id).toBe('explicit-id');
    // the counter still advances, even though the first call didn't consume a generated id
    expect(second.id).toBe('ctx-2');
  });

  it('fills in a deterministic default title from a faker instance seeded by the item id', () => {
    // two independent factories generating the same id must produce the same title
    const titleA = createContextItemFactory()().title;
    const titleB = createContextItemFactory()().title;

    expect(titleA).toEqual(titleB);
    expect(titleA).toEqual(expect.any(String));
  });
});
