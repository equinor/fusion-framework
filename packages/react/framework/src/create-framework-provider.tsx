import type React from 'react';
import { lazy } from 'react';
import initFusion from '@equinor/fusion-framework';
import { FrameworkConfigurator } from '@equinor/fusion-framework';

import { FrameworkProvider } from './context';
import type { AnyModule, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';

/**
 * Creates a lazy-loaded React component that initialises a Fusion Framework
 * instance and exposes it via context providers.
 *
 * @remarks
 * This is the low-level factory used by the {@link Framework} component.
 * Call it when you need fine-grained control over memoisation or when you
 * want to embed the provider in a custom `<Suspense>` boundary.
 *
 * The returned component is created with `React.lazy`, so it **must** be
 * rendered inside a `<Suspense>` boundary.
 *
 * @template TModules - Tuple of additional module types to register.
 * @template TRef - Type of the optional parent module-instance reference.
 *
 * @param cb - Callback that receives a {@link FrameworkConfigurator} (and an
 *   optional parent ref) for registering modules and configuration.
 * @param ref - Optional parent module instance to inherit configuration from.
 * @returns A `React.lazy` component that provides the initialised framework
 *   to its children.
 *
 * @example
 * ```tsx
 * import { createFrameworkProvider } from '@equinor/fusion-framework-react';
 *
 * const Portal = () => {
 *   const FrameworkProvider = createFrameworkProvider((config) => {
 *     config.http.configureClient('my-api', { baseUri: 'https://api.example.com' });
 *   });
 *
 *   return (
 *     <Suspense fallback={<span>Loading…</span>}>
 *       <FrameworkProvider>
 *         <App />
 *       </FrameworkProvider>
 *     </Suspense>
 *   );
 * };
 * ```
 */
export const createFrameworkProvider = <
  TModules extends Array<AnyModule> = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TRef extends ModulesInstanceType<[AnyModule]> = any,
>(
  cb: (configurator: FrameworkConfigurator<TModules>, ref?: TRef) => void | Promise<void>,
  ref?: TRef,
): React.LazyExoticComponent<React.FunctionComponent<React.PropsWithChildren<unknown>>> =>
  lazy(async () => {
    const configurator = new FrameworkConfigurator<TModules>();
    await cb(configurator, ref);
    const framework = await initFusion(configurator, ref);
    return {
      default: ({ children }: { children?: React.ReactNode }) => (
        <FrameworkProvider value={framework}>
          <ModuleProvider value={framework.modules}>{children}</ModuleProvider>
        </FrameworkProvider>
      ),
    };
  });
