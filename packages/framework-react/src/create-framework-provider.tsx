import React, { lazy } from 'react';
import initFusion from '@equinor/fusion-framework';
import type { FusionConfigurator } from '@equinor/fusion-framework';

import { FrameworkProvider } from './context';
import { AnyModule } from '@equinor/fusion-framework-module';

/**
 * Create a framework provider for react.
 *
 * This function is for providers of framework, like a portal.
 *
 * @param configurator - callback for configuring modules
 * @example
 * ```tsx
 * const config: FusionConfigurator = (config) => {}
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
export const createFrameworkProvider = <TModules extends Array<AnyModule> = []>(
    configurator: FusionConfigurator<TModules>,
    modules?: TModules
): React.LazyExoticComponent<React.FunctionComponent> =>
    lazy(async () => {
        const framework = await initFusion(configurator, modules);
        return {
            default: ({ children }: { children?: React.ReactNode }) => (
                <FrameworkProvider value={framework}>{children}</FrameworkProvider>
            ),
        };
    });
