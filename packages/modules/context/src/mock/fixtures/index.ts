/**
 * Fixture generators for {@link ContextMockConfigurator} test data.
 *
 * @remarks
 * A separate entry point from `@equinor/fusion-framework-module-context/mock`
 * because these factories use {@link https://fakerjs.dev/ | faker}
 * (`@faker-js/faker`) for realistic values — an optional peer dependency, only
 * required if this entry point is imported. `enableContextMock` and
 * `ContextMockConfigurator` on the main `/mock` entry point never require it.
 *
 * @example
 * ```typescript
 * import { createContextItems } from '@equinor/fusion-framework-module-context/mock/fixtures';
 *
 * const [project] = createContextItems([{ type: 'ProjectMaster' }]);
 * ```
 *
 * @packageDocumentation
 */
export {
  createContextItemFactory,
  type MockContextItemFactory,
} from './create-context-item-factory';
export {
  createContextItems,
  type ContextTypeSeed,
  type ContextItemOverrides,
} from './create-context-items';
