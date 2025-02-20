import React, { lazy } from 'react';
import initFusion from '@equinor/fusion-framework';
import { FrameworkConfigurator } from '@equinor/fusion-framework';

import { FrameworkProvider } from './context';
import type { AnyModule, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';

/**
 * Create a framework provider for react.
 *
 * This function is for providers of framework, like a portal.
 *
 * @param configurator - callback for configuring modules
 * @example
 * ```tsx
 * const config: FrameworkConfigurator = (config) => {}
 * const Portal = () => {
 *   const Framework = createFrameworkProvider(config);
 *   return (
 *      <Suspense fallback={<span>loading...</span>}>
 *          <Framework>{children}</Framework>
 *      </Suspense>
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
