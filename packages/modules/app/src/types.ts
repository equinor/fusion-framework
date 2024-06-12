import { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import IApp from './app';
import { ApplicationManifest } from './helpers';

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

export type AppEnv<TConfig = unknown, TProps = unknown> = {
    basename?: string;
    manifest?: ApplicationManifest;
    config?: AppConfig<TConfig>;
    props?: TProps;
};

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export type AppType = 'standalone' | 'report' | 'launcher' | 'template';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CurrentApp<TModules extends Array<AnyModule> = [], TEnv = any> =
    | IApp<TEnv, TModules>
    | null
    | undefined;

export type AppAuth = {
    clientId: string;
    resources: string[];
};

type AppCategory = {
    id: string;
    name?: string | null;
    displayName?: string | null;
    color?: string | null;
    defaultIcon?: string | null;
    sortOrder: number;
};

type AppVisualization = {
    color?: string | null;
    icon?: string | null;
    sortOrder: number;
};

export type AzureId = {
    azureId: string;
};
export type AzureUniqueId = {
    azureUniqueId: string;
};
export type AppBuild<TUploaderId = AzureId | AzureUniqueId> = {
    version?: string | null;
    entryPoint?: string | null;
    tags?: string[] | null;
    tag?: string | null;
    assetPath?: string | null;
    configUrl?: string | null;
    timestamp?: string | null;
    commitSha?: string | null;
    githubRepo?: string | null;
    projectPage?: string | null;
    uploadedBy?: {
        displayName?: string | null;
        mail?: string | null;
        upn?: string | null;
        accountType?: string | null;
        accountClassification?: string | null;
    } & TUploaderId;
};

export type AppOwnerOrAdmin = {
    id: string;
    azureId?: string | null;
    azureUniqueId?: string | null;
    displayName?: string | null;
    mail?: string | null;
    upn?: string | null;
    accountType?: string | null;
    accountClassification?: string | null;
};

export interface AppManifest {
    key: string | null;
    name?: string | null;
    entry?: string | null;
    version?: string | null;
    shortName?: string | null;
    description?: string | null;
    keywords?: string[];
    type?: AppType;
    isPinned?: boolean;
    tags?: string[] | null;
    tag?: string | null;
    auth?: AppOwnerOrAdmin[];
    icon?: string | null;
    order?: number;
    publishedDate?: string | null;
    accentColor?: string | null;
    categoryId?: string | null;
    category?: AppCategory;
    hide?: boolean;
    visualization?: AppVisualization;
    admins?: AppOwnerOrAdmin[];
    owners?: AppOwnerOrAdmin[];
    build?: AppBuild<AzureId>;
}

export type Endpoint = { url: string; scopes?: string[] };

export type AppConfig<TEnvironment = unknown> = {
    environment?: TEnvironment;
    endpoints?: Record<string, Endpoint>;
};

/**
 * @template TEnvironment - name of hosted environment
 * @template TModule - ES module type (import return type)
 */
export type AppBundle<TEnvironment = unknown, TModule = unknown> = {
    manifest: ApplicationManifest;
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

export type ApiAppVersionConfig = {
    environment: string;
    endpoints: Record<
        string,
        {
            url: string;
            scopes: string[];
        }
    >;
};

export type ApiApp = {
    appKey: string | null;
    displayName?: string | null;
    description?: string | null;
    type?: AppType;
    isPinned?: boolean;
    templateSource?: string | null;
    category?: AppCategory;
    visualization: {
        color: string | null;
        icon: string | null;
        sortOrder: number;
    };
    keywords: string[];
    admins: AppOwnerOrAdmin[];
    owners: AppOwnerOrAdmin[];
    build: AppBuild<AzureUniqueId>;
};
