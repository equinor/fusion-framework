import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { QueryCtorOptions } from '@equinor/fusion-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

/**
 * WidgetEnv type represents the environment configuration for a widget.
 */
export type WidgetEnv<TProps = unknown> = {
    basename?: string;
    manifest: WidgetManifest;
    props?: TProps;
};

/**
 * IClient interface represents a client with properties and methods for widget-related operations.
 */
export type IClient = {
    apiVersion: string;
    baseImportUrl: string;
    getWidgetManifest: QueryCtorOptions<WidgetManifest, GetWidgetParameters>;
    getWidgetConfig: QueryCtorOptions<WidgetConfig, GetWidgetParameters>;
};

/**
 * ModuleDeps type represents a tuple of dependencies required for a module.
 */
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

/**
 * GetWidgetParameters type represents parameters for retrieving widget information.
 */
export type GetWidgetParameters = {
    widgetKey: string;
    args?: { type: 'version' | 'tag'; value: string };
};

/**
 * WidgetEndpointBuilder type represents a function for building widget endpoints based on GetWidgetParameters.
 */
export type WidgetEndpointBuilder = (args: GetWidgetParameters) => string;

/**
 * WidgetManifest type represents the manifest information of a widget.
 */
export type WidgetManifest = {
    id: string;
    name: string;
    version: string;
    description: string;
    maintainers?: string[];
    entryPoint: string;
    assetPath: string;
};

/**
 * Endpoint type represents an endpoint with properties like name, uri, and optional scopes.
 */
export type Endpoint = { name: string; uri: string; scopes?: string[] };

/**
 * WidgetConfig type represents the configuration for a widget, including environment and endpoints.
 */
export type WidgetConfig<TEnvironment = unknown> = {
    environment: TEnvironment;
    endpoints: Record<string, string | Endpoint>;
};

/**
 * WidgetModules type represents a combination of modules related to events and service discovery.
 */
export type WidgetModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, ServiceDiscoveryModule]
>;

/**
 * WidgetProps type represents widget properties as a record of PropertyKey to unknown.
 */
export type WidgetProps = Record<PropertyKey, unknown>;

/**
 * WidgetRenderArgs type represents arguments for rendering a widget, including fusion, environment, and optional properties.
 */

export type WidgetRenderArgs<
    TFusion extends Fusion = Fusion,
    TEnv = WidgetEnv,
    TProps extends WidgetProps = WidgetProps,
> = {
    fusion: TFusion;
    env: TEnv;
    props?: TProps;
};

/**
 * WidgetScriptModule type represents a script module for a widget with functions for rendering, rendering icons, etc.
 */
export type WidgetScriptModule<TProps extends WidgetProps = WidgetProps> = {
    default: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderWidget: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderIcon: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    render: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
};

/**
 * WidgetModulesInstance type represents an instance of widget modules.
 */
export type WidgetModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<WidgetModules<TModules>>;

/**
 * WidgetState type represents the state of a widget, including properties like name, status, config, manifest, modules, and instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetState<TModules = any> = {
    name: string;
    status: Set<string>;
    config?: WidgetConfig;
    manifest?: WidgetManifest;
    modules?: WidgetScriptModule;
    instance?: WidgetModulesInstance<TModules>;
};
/**
 * WidgetStateInitial type represents an initial state of a widget, omitting the status property.
 */
export type WidgetStateInitial = Omit<WidgetState, 'status'>;
