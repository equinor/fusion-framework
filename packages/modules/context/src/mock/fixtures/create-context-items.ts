import { Faker, en } from '@faker-js/faker';

import type { ContextItem } from '../../types';
import { stringToSeed } from './string-to-seed';

/** Overridable {@link ContextItem} fields. `id` and `type` are always assigned by the type seed itself. */
export type ContextItemOverrides = Partial<Omit<ContextItem, 'id' | 'type'>>;

/**
 * Describes one context type to generate fixtures for.
 *
 * @param type - The context type id (e.g. `'ProjectMaster'`, `'Contract'`).
 * @param count - Number of items to generate for this type. Defaults to `1`.
 * @param parentTypeIds - Parent type ids, when this type is a child in the
 * type hierarchy — sets `type.isChildType`/`type.parentTypeIds` on every
 * generated item of this type.
 * @param item - Per-item overrides, called with the item's 1-based index
 * within this type.
 */
export interface ContextTypeSeed {
  type: string;
  count?: number;
  parentTypeIds?: string[];
  item?: (index: number) => ContextItemOverrides;
}

/**
 * Generates a batch of {@link ContextItem} fixtures across one or more
 * context types, with deterministic ids, a realistic `title` from
 * {@link https://fakerjs.dev/ | faker} (`@faker-js/faker`, a peer dependency —
 * only required if this factory is imported), and a consistent type hierarchy.
 *
 * @remarks
 * Ids are `<type>-<n>` (lowercased type, 1-based per type), so results are
 * stable across runs and readable in test failures. `title` is filled in from
 * a faker instance seeded by that same id, so it's just as deterministic.
 * Feeding the result to `ContextMockConfigurator.setContexts` is enough to
 * make related-context resolution work across types — the mock's
 * `relatedContexts` filters this same seeded pool by type, so a child-typed
 * item resolves into a parent of its `parentTypeIds` without any per-item
 * wiring. That default is a simplification: the real context API resolves
 * relations per specific instance (a `Contract` belongs to one particular
 * `ProjectMaster`, not every `ProjectMaster` in the system) — seed only one
 * instance per type when that distinction doesn't matter to the test, or use
 * `ContextMockConfigurator.setRelatedContexts` to pin a specific item's
 * relations when it does.
 *
 * @param types - The context types, and how many items to generate for each.
 * @returns The generated context items, in the order the type seeds were given.
 *
 * @example Seed a project type and a child contract type
 * ```ts
 * const [project] = createContextItems([{ type: 'ProjectMaster' }]);
 * const [contract] = createContextItems([
 *   { type: 'Contract', parentTypeIds: ['ProjectMaster'] },
 * ]);
 *
 * enableContextMock(configurator, (mock) => {
 *   mock.setContexts([project, contract]);
 *   // relatedContexts({ item: contract, filter: { type: ['ProjectMaster'] } }) now resolves `project`
 * });
 * ```
 */
export const createContextItems = (types: ContextTypeSeed[]): ContextItem[] =>
  types.flatMap(({ type, count = 1, parentTypeIds, item }) =>
    Array.from({ length: count }, (_, i): ContextItem => {
      const index = i + 1;
      const id = `${type.toLowerCase()}-${index}`;
      const faker = new Faker({ seed: stringToSeed(id), locale: en });
      return {
        value: {},
        title: faker.company.name(),
        ...item?.(index),
        id,
        type: parentTypeIds ? { id: type, isChildType: true, parentTypeIds } : { id: type },
      };
    }),
  );

export default createContextItems;
