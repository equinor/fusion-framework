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
    basename: string;
};

export type ComponentRenderer<TFusion extends Fusion = Fusion, TEnv = AppEnv> = (
    fusion: TFusion,
    env: TEnv
) => React.LazyExoticComponent<React.ComponentType>;

/**
 * Creates an lazy loading Component which configures modules
 * and provides context to framework and configured modules
 *
 * __Exposed providers__
 * @see {@link @equinor/fusion-framework-react.FrameworkProvider | FrameworkProvider}
 * @see {@link ModuleProvider | ModuleProvider}
 *
 * @template TModules module types included in configuration.
 * @param Component - React component to render
 * @param configure - Callback for configuring application
 * @param modules - required modules for application
 */
export const makeComponent = <
    TModules extends Array<AnyModule>,
    TRef extends Fusion = Fusion,
    TEnv extends AppEnv = AppEnv
>(
    Component: React.ReactNode,
    args: { fusion: TRef; env: TEnv },
    configure?: AppModuleInitiator<TModules, TRef, TEnv>
) =>
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
