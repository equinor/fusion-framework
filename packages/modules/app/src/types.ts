import { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import IApp from './app';
import { ApplicationManifest } from './ApplicationManifest';

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
    version?: string;
    entryPoint?: string;
    tags?: string[];
    tag?: string;
    assetPath?: string;
    configUrl?: string;
    timestamp?: string;
    commitSha?: string;
    githubRepo?: string;
    projectPage?: string;
    uploadedBy?: {
        displayName?: string;
        mail?: string;
        upn?: string;
        accountType?: string;
        accountClassification?: string;
    } & TUploaderId;
};

export type AppOwnerOrAdmin = {
    id: string;
    azureId?: string;
    azureUniqueId?: string;
    displayName?: string;
    mail?: string;
    upn?: string;
    accountType?: string;
    accountClassification?: string;
};

export interface AppManifest {
    key: string;
    name?: string;
    entry?: string;
    version?: string;
    shortName?: string;
    description?: string;
    keywords?: string[];
    type?: AppType;
    isPinned?: boolean;
    tags?: string[];
    tag?: string;
    auth?: AppOwnerOrAdmin[];
    icon?: string;
    order?: number;
    publishedDate?: string;
    accentColor?: string;
    categoryId?: string;
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
    appKey: string;
    displayName?: string;
    description?: string;
    type?: AppType;
    isPinned?: boolean;
    templateSource?: string;
    category?: AppCategory;
    visualization: {
        color: string;
        icon: string;
        sortOrder: number;
    };
    keywords: string[];
    admins: AppOwnerOrAdmin[];
    owners: AppOwnerOrAdmin[];
    build: AppBuild<AzureUniqueId>;
};
