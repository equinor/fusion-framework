import React, { lazy } from 'react';
import initFusion from '@equinor/fusion-framework';
import type { FusionConfigurator } from '@equinor/fusion-framework';

import { FrameworkProvider } from './context';

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
export const createFrameworkProvider = (
    configurator: FusionConfigurator
): React.LazyExoticComponent<React.FunctionComponent> =>
    lazy(async () => {
        const framework = await initFusion(configurator);
        return {
            default: ({ children }: { children?: React.ReactNode }) => (
                <FrameworkProvider value={framework}>{children}</FrameworkProvider>
            ),
        };
    });
