import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type NavigationModule } from '../module';

import { NavigationMockConfigurator } from './NavigationMockConfigurator';

/**
 * The navigation module with a mock configurator that always resolves to
 * {@link MemoryHistory}, instead of falling back to real browser history.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the
 * production one, untouched, so the real `NavigationProvider`, basename
 * localization, and navigate/push/replace flows run exactly as they do in
 * production — a test observes real navigation behavior against an
 * in-memory history, not a reimplementation of it.
 */
export const navigationMockModule: NavigationModule = {
  ...module,
  configure: () => new NavigationMockConfigurator(),
};

/**
 * Configuration callback for {@link enableNavigationMock}.
 *
 * @template TRef - Reference type forwarded to the callback.
 */
export type NavigationMockConfigFn<TRef = unknown> = (
  configurator: NavigationMockConfigurator,
  ref: TRef,
) => void;

/**
 * Enables the navigation module against an in-memory {@link MemoryHistory},
 * so a test's navigation state never touches (or leaks from) the real
 * browser location.
 *
 * @param configurator - The modules configurator to register on.
 * @param basenameOrOptions - Optional basename string, or a `configure` callback for seeding the initial location or further setup.
 * @template TRef - Reference type forwarded to `configure`.
 *
 * @example
 * ```typescript
 * enableNavigationMock(configurator, {
 *   configure: (config) => config.setInitialLocation('/users/42'),
 * });
 * ```
 */
export const enableNavigationMock = <TRef = unknown>(
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  basenameOrOptions?: string | { configure: NavigationMockConfigFn<TRef> },
): void => {
  configurator.addConfig({
    module: navigationMockModule,
    configure(config, ref) {
      // A string shortcut sets the basename directly; otherwise defer to the caller's configure callback.
      if (typeof basenameOrOptions === 'string') {
        config.setBasename(basenameOrOptions);
      } else if (typeof basenameOrOptions === 'object' && 'configure' in basenameOrOptions) {
        basenameOrOptions.configure(config as NavigationMockConfigurator, ref);
      }
    },
  });
};

export default enableNavigationMock;
