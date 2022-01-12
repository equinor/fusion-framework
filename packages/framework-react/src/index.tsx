/**
 * [[include:README.MD]]
 * @module
 */

import React, { createContext, lazy, useContext } from 'react';
import initFusion from '@equinor/fusion-framework';
import type { Fusion, FusionConfigurator } from '@equinor/fusion-framework';

const frameworkContext = createContext<Fusion | null>(null);

/**
 * Component for providing framework.
 *
 * @remarks
 * Should be created by {@link createFrameworkProvider}
 *
 * @example
 * ```tsx
 * import {FrameworkProvider} from '@equinor/fusion-framework-react';
 * export const Component = (args: React.PropsWithChildren<{framework: Fusion}>) => {
 *   return (
 *      <FrameworkProvider value={args.framework}>
 *        {args.children}
 *      </FrameworkProvider>
 *   );
 * }
 * ```
 */
export const FrameworkProvider = frameworkContext.Provider;

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
                <frameworkContext.Provider value={framework}>{children}</frameworkContext.Provider>
            ),
        };
    });

/**
 * @example
 * ```ts
 * const useSometing = () => {
 *  const fusion = useFramework();
 *  return fusion.something;
 * }
 * ```
 */
export const useFramework = (): Fusion => {
    let context = useContext(frameworkContext);
    if (!context) {
        console.warn('could not locate fusion in context!');
    }
    context ??= window.Fusion;
    if (!context) {
        console.error('Could not load framework, might not be initiated?');
    }
    return context;
};

export default FrameworkProvider;
