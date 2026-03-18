import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { AppConfig } from './AppConfig';
import type IApp from './app';

/**
 * Re-export of {@link ConfigEnvironment} from AppConfig.
 */
export type ConfigEnvironment = Record<string, unknown>;
export type { AppConfig } from './AppConfig';

// biome-ignore lint/suspicious/noExplicitAny: TODO - needs proper type definition
type Fusion = any;

/**
 * Environment bindings passed to an application at render time,
 * including its manifest, configuration, base path, and custom props.
 *
 * @template TEnv - Shape of the environment configuration record.
 * @template TProps - Shape of custom properties passed to the app.
 */
export type AppEnv<TEnv extends ConfigEnvironment = ConfigEnvironment, TProps = unknown> = {
  basename?: string;
  manifest?: AppManifest;
  config?: AppConfig<TEnv>;
  props?: TProps;
};

/**
 * Reference to an application, used to fetch the app manifest from the app service.
 * The `tag` defaults to `'latest'` when omitted.
 */
export type AppReference = {
  appKey: string;
  tag?: string; // defaults to 'latest'
};

/**
 * Required module dependencies for the app module.
 *
 * The app module depends on HTTP (for API calls), service discovery
 * (for resolving the apps service URL), and events (for lifecycle notifications).
 */
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

/**
 * Per-user application settings, stored as an arbitrary key-value record.
 * Read via `getAppSettings` and written via `updateAppSettings` on the provider.
 */
export interface AppSettings {
  [key: string]: unknown;
}

/**
 * Discriminant union of supported application types.
 *
 * - `'standalone'` – A full standalone application.
 * - `'template'` / `'template-app'` – Template-based apps.
 * - `'landing-page'` – Portal landing pages.
 * - `'report'` / `'launcher'` – Legacy types (will be removed).
 */
export type AppType =
  | 'standalone'
  | 'report'
  | 'launcher'
  | 'template'
  | 'template-app'
  | 'landing-page';

/**
 * The currently active application, or `null` when cleared, or `undefined`
 * when no application has been set yet.
 *
 * @template TModules - Additional framework modules the app depends on.
 * @template TEnv - Shape of the environment configuration record.
 */
export type CurrentApp<
  TModules extends Array<AnyModule> = [],
  TEnv extends ConfigEnvironment = ConfigEnvironment,
> = IApp<TEnv, TModules> | null | undefined;

type Nullable<T> = T | null | undefined;

/**
 * Represents a person associated with an application (admin or owner).
 */
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

/** An application administrator. */
export type AppAdmin = AppPerson;

/** An application owner. */
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

/**
 * Build metadata returned by the app service for a specific application version.
 * Contains the script entry point, asset path, tags, and optional CI metadata.
 */
export type AppBuildManifest = {
  version: string;
  entryPoint: string;
  tags?: Nullable<string[]>;
  tag?: Nullable<string>;
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

/**
 * Full manifest describing a registered Fusion application, including
 * display metadata, category, admins/owners, build info, and optional route schemas.
 */
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
 * A loaded application bundle containing its manifest, config, and imported script module.
 *
 * @template TEnvironment - Shape of the environment config record.
 * @template TModule - Type of the dynamically imported ES module.
 */
export type AppBundle<
  TEnvironment extends ConfigEnvironment = ConfigEnvironment,
  TModule = unknown,
> = {
  manifest: AppManifest;
  config: AppConfig<TEnvironment>;
  module: TModule;
};

/**
 * Combined module type merging the app's own modules with base framework modules
 * (Event, HTTP, MSAL).
 *
 * @template TModules - Additional modules contributed by the application.
 */
export type AppModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
  TModules,
  [EventModule, HttpModule, MsalModule]
>;

/**
 * Arguments passed to an application's `renderApp` or default export function
 * when mounting the application into a DOM element.
 *
 * @template TFusion - Type of the Fusion framework instance.
 * @template TEnv - Type of the environment bindings.
 */
export type ComponentRenderArgs<TFusion extends Fusion = Fusion, TEnv = AppEnv> = {
  fusion: TFusion;
  env: TEnv;
};

/**
 * Shape of the ES module exported by an application's script bundle.
 *
 * Must expose either a `default` export or a `renderApp` function (or both)
 * that mounts the application into a host DOM element.
 */
export type AppScriptModule = {
  default: (el: HTMLElement, args: ComponentRenderArgs) => VoidFunction;
  renderApp: (el: HTMLElement, args: ComponentRenderArgs) => VoidFunction;
};

/**
 * Instantiated module collection for a running application.
 *
 * @template TModules - Additional modules contributed by the application.
 */
export type AppModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
  ModulesInstance<AppModules<TModules>>;
