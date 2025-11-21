import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { AppConfig } from './AppConfig';
import type IApp from './app';

export type ConfigEnvironment = Record<string, unknown>;
export type { AppConfig } from './AppConfig';

// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/suspicious/noExplicitAny: TODO - needs proper type definition
type Fusion = any;

export type AppEnv<TEnv extends ConfigEnvironment = ConfigEnvironment, TProps = unknown> = {
  basename?: string;
  manifest?: AppManifest;
  config?: AppConfig<TEnv>;
  props?: TProps;
};

/**
 * Reference to an app, used to fetch app manifest from app service
 */
export type AppReference = {
  appKey: string;
  tag?: string; // defaults to 'latest'
};

// TODO: change to module-services when new app service is created
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

export interface AppSettings {
  [key: string]: unknown;
}

// TODO: remove `report` and `launcher` when legacy apps are removed
export type AppType =
  | 'standalone'
  | 'report'
  | 'launcher'
  | 'template'
  | 'template-app'
  | 'landing-page';

export type CurrentApp<
  TModules extends Array<AnyModule> = [],
  TEnv extends ConfigEnvironment = ConfigEnvironment,
> = IApp<TEnv, TModules> | null | undefined;

type Nullable<T> = T | null | undefined;

type AppPerson = {
  id: string;
  azureUniqueId: string;
  displayName: string;
  mail?: Nullable<string>;
  upn?: Nullable<string>;
  accountType: string;
  accountClassification?: Nullable<string>;
  isExpired?: Nullable<boolean>;
};

export type AppAdmin = AppPerson;

export type AppOwner = AppPerson;

/**
 * Schema entry format for route documentation in app manifests.
 * Each entry represents a route with its path, description, and optional parameter/search schemas.
 */
export type RouteSchemaEntry = [
  path: string,
  description: string,
  options?: {
    params?: Record<string, string>;
    search?: Record<string, string>;
  },
];

export type AppBuildManifest = {
  version: string;
  entryPoint: string;
  tags?: Nullable<string[]>;
  tag?: Nullable<'latest' | 'preview'>;
  assetPath?: Nullable<string>;
  configUrl?: Nullable<string>;
  timestamp?: Nullable<string>;
  commitSha?: Nullable<string>;
  githubRepo?: Nullable<string>;
  projectPage?: Nullable<string>;
  annotations?: Nullable<Record<string, string>>;
  allowedExtensions?: Nullable<string[]>;
  uploadedBy?: Nullable<AppOwner>;
};

export interface AppManifest {
  /** @deprecated will be removed, use appKey */
  key?: string;
  appKey: string;
  /** @deprecated will be removed, use displayName */
  name?: string;
  displayName: string;
  description: string;
  type: AppType;
  isPinned?: Nullable<boolean>;
  templateSource?: Nullable<string>;
  category?: Nullable<{
    id: string;
    name: string;
    displayName: string;
    color: string;
    defaultIcon: string;
    sortOrder: number;
  }>;
  visualization?: Nullable<{
    color?: Nullable<string>;
    icon?: Nullable<string>;
    sortOrder: number;
  }>;
  keywords?: Nullable<string[]>;
  admins?: Nullable<AppAdmin[]>;
  owners?: Nullable<AppOwner[]>;
  build?: Nullable<AppBuildManifest>;
  /** Route schema entries for documentation and API schema generation */
  routes?: Nullable<RouteSchemaEntry[]>;
}

/**
 * @template TEnvironment - name of hosted environment
 * @template TModule - ES module type (import return type)
 */
export type AppBundle<
  TEnvironment extends ConfigEnvironment = ConfigEnvironment,
  TModule = unknown,
> = {
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
