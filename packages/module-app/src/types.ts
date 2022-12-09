import { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

export type AppEnv<TConfig = unknown, TProps = unknown> = {
    basename?: string;
    manifest?: AppManifest;
    config?: AppConfig<TConfig>;
    props?: TProps;
};

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type AppType = 'standalone' | 'report' | 'launcher';

export type AppAuth = {
    clientId: string;
    resources: string[];
};

type AppCategory = {
    id?: string;
    name: string | null;
    color: string | null;
    defaultIcon: string | null;
};

export type AppManifest = {
    appKey: string;
    name: string;
    shortName: string;
    version: string;
    description: string;
    type: AppType;
    tags: string[];
    // context?: ContextManifest;
    auth?: AppAuth[];
    icon?: string;
    order: number | null;
    publishedDate: Date | null;
    accentColor: string | null;
    categoryId: string | null;
    category: AppCategory | null;
    hide?: boolean;
    entry: string;
};

export type Endpoint = { name: string; uri: string; scopes?: string[] };

export type AppConfig<TEnvironment = unknown> = {
    environment: TEnvironment;
    endpoints: Record<string, string | Endpoint>;
};

/**
 * @template TEnvironment - name of hosted environment
 * @template TModule - ES module type (import return type)
 */
export type AppBundle<TEnvironment = unknown, TModule = unknown> = {
    manifest: AppManifest;
    config: AppConfig<TEnvironment>;
    module: TModule;
};

export type AppModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
    TModules,
    [EventModule, HttpModule, MsalModule]
>;

export type ComponentRenderArgs<TFusion extends Fusion = Fusion, TEnv = AppEnv> = {
    fusion: TFusion;
    env: TEnv;
};

export type AppScriptModule = {
    default: (el: HTMLElement, args: ComponentRenderArgs) => VoidFunction;
    renderApp: (el: HTMLElement, args: ComponentRenderArgs) => VoidFunction;
};

export type AppModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
    ModulesInstance<AppModules<TModules>>;
