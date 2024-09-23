import { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import IApp from './app';

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

export type AppType = 'standalone' | 'report' | 'launcher' | 'template';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CurrentApp<TModules extends Array<AnyModule> = [], TEnv = any> =
    | IApp<TEnv, TModules>
    | null
    | undefined;

export type AppAdmin = {
    id: string;
    azureUniqueId?: string;
    displayName?: string;
    mail?: string;
    upn?: string;
    accountType?: string;
    accountClassification?: string;
};

export type AppOwner = AppAdmin;

export type AppBuildManifest = {
    version?: string;
    entryPoint?: string;
    tags?: string[];
    tag?: 'latest' | 'preview';
    assetPath?: string;
    configUrl?: string;
    timestamp?: string;
    commitSha?: string;
    githubRepo?: string;
    projectPage?: string;
    annotations?: Record<string, string>;
    uploadedBy?: {
        azureUniqueId: string;
        displayName?: string;
        mail?: string;
        upn?: string;
        accountType?: string;
        accountClassification?: string;
    };
};

export interface AppManifest {
    /** @deprecated will be removed, use appKey */
    key?: string;
    appKey: string;
    /** @deprecated will be removed, use displayName */
    name?: string;
    displayName?: string;
    description?: string;
    type?: AppType;
    isPinned?: boolean;
    templateSource?: string;
    catagory?: {
        id: string;
        name: string;
        displayName: string;
        color: string;
        defaultIcon: string;
        sortOrder: 1000;
    };
    visualization?: {
        color?: string;
        icon?: string;
        sortOrder: number;
    };
    keywords?: string[];
    admins?: AppAdmin[];
    owners?: AppOwner[];
    build?: AppBuildManifest;
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

// export type ApiAppVersionConfig = {
//     environment: string;
//     endpoints: Record<
//         string,
//         {
//             url: string;
//             scopes: string[];
//         }
//     >;
// };

// export type ApiApp = {
//     appKey: string;
//     displayName?: string;
//     description?: string;
//     type?: AppType;
//     isPinned?: boolean;
//     templateSource?: string;
//     category?: AppCategory;
//     visualization: {
//         color: string;
//         icon: string;
//         sortOrder: number;
//     };
//     keywords: string[];
//     admins: AppOwnerOrAdmin[];
//     owners: AppOwnerOrAdmin[];
//     build: AppBuild<AzureUniqueId>;
// };
