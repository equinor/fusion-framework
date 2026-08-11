import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';

import { mockAppModules, enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { FrameworkProvider } from '@equinor/fusion-framework-react';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';

/** Manifest used when a test does not care about its own app identity. */
const defaultManifest: AppEnv['manifest'] = {
  appKey: 'test-app',
  displayName: 'Test App',
  description: 'A test application',
  type: 'standalone',
};

/**
 * Options for {@link renderAppComponent}.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 */
export interface RenderAppComponentOptions<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
> extends Omit<RenderOptions, 'wrapper'> {
  /** Configuration callback forwarded to {@link mockAppModules}. */
  configure?: AppMockConfigureFn<TModules, TEnv>;
  /** The application environment; defaults to a generic standalone test app. */
  env?: TEnv;
  /**
   * The parent Fusion instance; defaults to a fresh {@link mockFramework} instance with
   * this app's own manifest served. Pass one built beforehand to reuse a single instance
   * across multiple render calls, or to pre-configure parent-level modules (e.g. `http`,
   * `context`, `serviceDiscovery`, or `app` itself for a component that loads another app).
   */
  fusion?: Fusion;
}

/**
 * Renders a component inside a real, mock-backed application module scope.
 *
 * @remarks
 * Wraps `@testing-library/react`'s `render` with the same provider nesting
 * `createComponent` uses in production — a `FrameworkProvider` (the parent Fusion
 * instance, from `mockFramework`) around a `ModuleProvider` (this app's own modules,
 * from `mockAppModules`, `@equinor/fusion-framework-app/mock`). See {@link renderAppHook}
 * for the equivalent helper when testing a hook in isolation, rather than a component.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 * @param ui - The component to render.
 * @param options - A `configure` callback and `env` for `mockAppModules`, plus any other `render` option.
 * @returns The `render` result, once the mocked application module scope resolves.
 *
 * @example
 * ```tsx
 * const { getByText } = await renderAppComponent(<Apploader appKey="child-app" />, {
 *   fusion: await mockFramework<[AppModule]>((configurator) => {
 *     // register the child app's own manifest against the `app` module
 *   }),
 * });
 * await waitFor(() => expect(getByText(/mounted/)).toBeInTheDocument());
 * ```
 */
export async function renderAppComponent<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
>(ui: ReactElement, options?: RenderAppComponentOptions<TModules, TEnv>): Promise<RenderResult> {
  const { configure, env, fusion: providedFusion, ...renderOptions } = options ?? {};
  const resolvedEnv = env ?? ({ manifest: defaultManifest } as TEnv);
  // Built explicitly (rather than left to `mockAppModules`'s own default) so the same
  // instance can also be handed to `FrameworkProvider` below — mirroring `createComponent`'s
  // `enableAppManifestMock` + `mockAppModules(cb, env, fusion)` composition.
  const fusion =
    providedFusion ??
    (await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, resolvedEnv),
    ));
  const modules = await mockAppModules(configure, resolvedEnv, fusion);
  return render(ui, {
    ...renderOptions,
    wrapper: ({ children }) => (
      <FrameworkProvider value={fusion}>
        <ModuleProvider value={modules}>{children}</ModuleProvider>
      </FrameworkProvider>
    ),
  });
}

export default renderAppComponent;
