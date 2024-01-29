import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { QueryCtorOptions } from '@equinor/fusion-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

export type WidgetEnv<TProps = unknown> = {
    basename?: string;
    manifest?: WidgetManifest;
    props?: TProps;
};

export type Client = {
    getWidget: QueryCtorOptions<WidgetManifest, GetWidgetParameters>;
};

export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type GetWidgetParameters = {
    widgetKey: string;
    args?: { type: 'version' | 'tag'; value: string };
};

export type WidgetEndpointBuilder = (args: GetWidgetParameters) => string;

export type WidgetManifest = {
    id: string;
    name: string;
    version: string;
    description: string;
    maintainers?: string[];
    entryPoint: string;
    assetPath: string;
};

export type WidgetModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, ServiceDiscoveryModule]
>;

export type WidgetProps = Record<PropertyKey, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetRenderArgs<
    TFusion extends Fusion = Fusion,
    TEnv = WidgetEnv,
    TProps extends WidgetProps = WidgetProps,
> = {
    fusion: TFusion;
    env: TEnv;
    props?: TProps;
};

export type WidgetScriptModule<TProps extends WidgetProps = WidgetProps> = {
    default: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderWidget: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderIcon: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    render: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
};

export type WidgetModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<WidgetModules<TModules>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetState<TModules = any> = {
    name: string;
    status: Set<string>;
    manifest?: WidgetManifest;
    modules?: WidgetScriptModule;
    instance?: WidgetModulesInstance<TModules>;
};
export type WidgetStateInitial = Omit<WidgetState, 'status'>;
