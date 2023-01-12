import { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

export type WidgetEnv = {
    manifest?: WidgetManifest;
    config?: WidgetConfig;
};

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type WidgetManifest = {
    id: string;
    name: string;
    version?: string;
    description: string;
    maintainers: string[];
};

export type WidgetConfig = {
    id: string;
    name: string;
    version: string;
    description: string;
    entryPoint: string;
    assetPath: string;
};

export type WidgetModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, HttpModule, MsalModule]
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
