import React, { lazy } from 'react';

import { FrameworkProvider } from '@equinor/fusion-framework-react';
import type { Fusion } from '@equinor/fusion-framework-react';

import { AppEnv, configureModules } from '@equinor/fusion-framework-app';
import type { AppModuleInitiator, AppModulesInstance } from '@equinor/fusion-framework-app';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { ModuleProvider as AppModuleProvider } from '@equinor/fusion-framework-react-module';

export type ComponentRenderArgs<TFusion extends Fusion = Fusion, TEnv = AppEnv> = {
    fusion: TFusion;
    env: TEnv;
};

export type ComponentRenderer<TFusion extends Fusion = Fusion, TEnv = AppEnv> = (
    fusion: TFusion,
    env: TEnv,
) => React.LazyExoticComponent<React.ComponentType>;

/**
 * Creates a lazy loading React Component that initializes and configures modules,
 * then provides the necessary context to both the Fusion framework and the configured modules.
 * This function is particularly useful for setting up a React application with modular architecture,
 * allowing for lazy loading of components along with their dependencies.
 *
 * __Exposed providers__:
 * - {@link @equinor/fusion-framework-react.FrameworkProvider | FrameworkProvider} to provide Fusion context.
 * - {@link @equinor/fusion-framework-react-module.ModuleProvider | ModuleProvider} to provide module instances.
 *
 * @template TModules The types of modules included in the configuration.
 * @template TRef The type of the Fusion instance.
 * @template TEnv The environment type for the application.
 * @param {React.ReactNode} Component - The React component to render lazily.
 * @param {Object} args - The arguments required for module configuration and component rendering.
 * @param {TRef} args.fusion - The Fusion instance to be used by the component and modules.
 * @param {TEnv} args.env - The environment context for the application.
 * @param {AppModuleInitiator<TModules, TRef, TEnv>} [configure] - Optional callback function for configuring application modules.
 * @returns {React.LazyExoticComponent<React.ComponentType>} A lazy component that, when rendered,
 * initializes the specified modules and provides the necessary Fusion and module context.
 */
export const makeComponent = <
    TModules extends Array<AnyModule>,
    TRef extends Fusion = Fusion,
    TEnv extends AppEnv = AppEnv,
>(
    Component: React.ReactNode,
    args: { fusion: TRef; env: TEnv },
    configure?: AppModuleInitiator<TModules, TRef, TEnv>,
): React.LazyExoticComponent<React.ComponentType> =>
    lazy(async () => {
        const init = configureModules<TModules, TRef, TEnv>(configure);
        const modules = (await init(args)) as unknown as AppModulesInstance;

        const { fusion } = args;

        modules.event.dispatchEvent('onReactAppLoaded', {
            detail: { modules, fusion },
            source: Component,
        });

        return {
            default: () => (
                <FrameworkProvider value={fusion}>
                    <AppModuleProvider value={modules}>{Component}</AppModuleProvider>
                </FrameworkProvider>
            ),
        };
    });

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onReactAppLoaded: FrameworkEvent<
            FrameworkEventInit<{ modules: AppModulesInstance; fusion: Fusion }, React.ComponentType>
        >;
    }
}

export default makeComponent;
