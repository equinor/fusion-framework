import type { ReactElement, ReactNode } from 'react';

import { FrameworkProvider } from '@equinor/fusion-framework-react';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import type { AppScope } from './resolve-app-scope';

/**
 * The provider nesting `createComponent` uses in production, for wrapping a component or
 * hook under test in its resolved {@link AppScope}.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @param scope - The resolved parent Fusion instance and application module scope.
 * @returns A wrapper component nesting a `FrameworkProvider` around a `ModuleProvider`.
 */
export function createAppScopeWrapper<TModules extends Array<AnyModule> | unknown = unknown>({
  framework,
  app,
}: AppScope<TModules>): (props: { children: ReactNode }) => ReactElement {
  return ({ children }: { children: ReactNode }) => (
    <FrameworkProvider value={framework}>
      <ModuleProvider value={app}>{children}</ModuleProvider>
    </FrameworkProvider>
  );
}
