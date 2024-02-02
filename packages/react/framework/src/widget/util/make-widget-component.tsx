import React, { lazy } from 'react';

import { WidgetEnv, configureWidgetModules } from '@equinor/fusion-framework-widget';

import type {
    WidgetModuleInitiator,
    WidgetModulesInstance,
} from '@equinor/fusion-framework-widget';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import { ModuleProvider as WidgetModuleProvider } from '@equinor/fusion-framework-react-module';
import { WidgetRenderArgs } from '@equinor/fusion-framework-module-widget';
import { Fusion } from '@equinor/fusion-framework';
import { FrameworkProvider } from '../../context';

export type ComponentRenderArgs<TFusion extends Fusion = Fusion, TEnv = WidgetEnv> = {
    fusion: TFusion;
    env: TEnv;
};

export type ComponentRenderer<TFusion extends Fusion = Fusion, TEnv = WidgetEnv> = (
    fusion: TFusion,
    env: TEnv,
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
export const makeWidgetComponent = <
    TModules extends Array<AnyModule>,
    TRef extends Fusion = Fusion,
    TEnv extends WidgetEnv = WidgetEnv,
>(
    Component: React.ReactElement,
    args: WidgetRenderArgs<TRef, TEnv>,
    configure?: WidgetModuleInitiator<TModules, TRef, TEnv>,
) =>
    lazy(async () => {
        const init = configureWidgetModules<TModules, TRef, TEnv>(configure);
        const modules = (await init(args)) as unknown as WidgetModulesInstance;

        const { fusion } = args;
        modules.event.dispatchEvent('onReactWidgetLoaded', {
            detail: { modules, fusion },
            source: Component,
        });

        const ComponentWithProps = React.cloneElement(Component, args.props);
        return {
            default: () => (
                <FrameworkProvider value={fusion}>
                    <WidgetModuleProvider value={modules}>
                        {ComponentWithProps}
                    </WidgetModuleProvider>
                </FrameworkProvider>
            ),
        };
    });

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onReactWidgetLoaded: FrameworkEvent<
            FrameworkEventInit<
                { modules: WidgetModulesInstance; fusion: Fusion },
                React.ComponentType
            >
        >;
    }
}

export default makeWidgetComponent;
