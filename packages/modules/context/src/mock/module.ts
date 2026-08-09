import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type ContextModule } from '../module';

import { ContextMockConfigurator } from './ContextMockConfigurator';

/**
 * The context module with an in-memory mock configurator instead of a real
 * context API.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the production
 * one, untouched, so a test exercises the real `ContextProvider` startup path,
 * `validateContext`/`resolveContext`, and parent-context propagation — a
 * rehearsal of the module, not a stand-in for it.
 */
export const contextMockModule: ContextModule = {
  ...module,
  configure: () => new ContextMockConfigurator(),
};

/**
 * Configuration callback for {@link enableContextMock}.
 */
export type ContextMockConfigFn = (mock: ContextMockConfigurator) => void | Promise<void>;

/**
 * Enables the context module against in-memory seeded data, so a test needs no
 * context API, no HTTP mock, and no service-discovery mock.
 *
 * @remarks
 * Registered last, this replaces whichever context module the configurator
 * already carries, so it works on a `FrameworkConfigurator` that pre-registers
 * the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to seed context items or override resolution.
 *
 * @example
 * ```ts
 * enableContextMock(configurator, (mock) => {
 *   mock.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });
 * });
 * ```
 */
export const enableContextMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: ContextMockConfigFn,
): void => {
  configurator.addConfig({ module: contextMockModule, configure } as {
    module: ContextModule;
  });
};
