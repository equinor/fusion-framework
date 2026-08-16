import { Faker, en } from '@faker-js/faker';

import type { ContextItem } from '../../types';
import { stringToSeed } from './string-to-seed';

/**
 * Creates one {@link ContextItem} fixture per call, for a single factory instance.
 *
 * @param overrides - Fields to override on the generated item. Supplying `id`
 * skips the sequential generator for that one item.
 * @returns A fully-formed {@link ContextItem}.
 */
export type MockContextItemFactory = (overrides?: Partial<ContextItem>) => ContextItem;

/**
 * Builds a {@link MockContextItemFactory} producing deterministic, sequential
 * ids of the form `<prefix>-<n>`, with a realistic `title` filled in by
 * {@link https://fakerjs.dev/ | faker} (`@faker-js/faker`, a peer dependency —
 * only required if this factory is imported).
 *
 * @remarks
 * Ids are scoped to the returned factory, not shared globally, so two tests
 * creating their own factory each start counting from `1` — a random id (e.g.
 * `crypto.randomUUID()`) would change on every run and break any assertion
 * that seeds one item and expects to see that same id again. The faker seed
 * is derived from that same id, so the generated `title` is just as
 * deterministic. For fixtures spanning several context types (e.g. a
 * parent/child type hierarchy), use `createContextItems` instead — it
 * assigns ids per type and wires the type hierarchy for you.
 *
 * @param prefix - The id prefix. Defaults to `'ctx'`.
 * @returns A function creating one {@link ContextItem} fixture per call.
 *
 * @example
 * ```ts
 * const createContextItem = createContextItemFactory();
 *
 * const project = createContextItem(); // id: 'ctx-1', title: a deterministic faker company name
 * const facility = createContextItem({ title: 'Facility A' }); // id: 'ctx-2', title overridden
 *
 * mock.setContexts([project, facility]);
 * ```
 */
export const createContextItemFactory = (prefix = 'ctx'): MockContextItemFactory => {
  const created: ContextItem[] = [];
  return (overrides: Partial<ContextItem> = {}): ContextItem => {
    // overrides.id, when supplied, always wins over the sequential generator
    const id = overrides.id ?? `${prefix}-${created.length + 1}`;
    const faker = new Faker({ seed: stringToSeed(id), locale: en });
    const item: ContextItem = {
      type: { id: 'Mock' },
      value: {},
      title: faker.company.name(),
      ...overrides,
      id,
    };
    created.push(item);
    return item;
  };
};

export default createContextItemFactory;
