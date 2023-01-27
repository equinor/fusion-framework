import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

export type WidgetEnv = {
    config?: WidgetManifest;
};

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type GetWidgetParameters = {
    widgetKey: string;
    args?: { type: 'version' | 'tag'; value: string };
};

export type WidgetManifest = {
    id: string;
    name: string;
    version: string;
    description: string;
    maintainers?: string[];
    entryPoint: string;
    assetPath: string;
    // TODO move to @equinor/fusion-widget
    importBundle: () => Promise<WidgetScriptModule>;
};

export type WidgetModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, ServiceDiscoveryModule]
>;

export type WidgetRenderArgs<TFusion extends Fusion = Fusion, TEnv = WidgetEnv> = {
    fusion: TFusion;
    env: TEnv;
};

export type WidgetScriptModule<
    TProps extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>
> = {
    default: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderWidget: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
};

export type WidgetModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<WidgetModules<TModules>>;
