import type { AnyModule, CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { QueryCtorOptions } from '@equinor/fusion-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = any;

/**
 * Environment descriptor passed to widget render functions.
 *
 * @template TProps - Custom props type forwarded to the widget.
 */
export type WidgetEnv<TProps = unknown> = {
  /** Base URL path the widget should use for routing (if applicable). */
  basename?: string;
  /** The resolved widget manifest. */
  manifest?: WidgetManifest;
  /** Arbitrary props forwarded from the host application. */
  props?: TProps;
};

/**
 * HTTP client abstraction used by the widget module to fetch manifests
 * and configurations from the backend API.
 */
export type IClient = {
  /** API version string appended as a query parameter to widget endpoints. */
  apiVersion: string;
  /** Base URL used to construct full import URLs for widget scripts. */
  baseImportUrl: string;
  /** Query constructor options for fetching a {@link WidgetManifest}. */
  getWidgetManifest: QueryCtorOptions<WidgetManifest, GetWidgetParameters>;
  /** Query constructor options for fetching a {@link WidgetConfig}. */
  getWidgetConfig: QueryCtorOptions<WidgetConfig, GetWidgetParameters>;
};

/**
 * Peer-dependency module tuple required by the widget module.
 *
 * Includes {@link HttpModule}, {@link ServiceDiscoveryModule}, and
 * {@link EventModule} (the latter two are optional at runtime).
 */
export type ModuleDeps = [HttpModule, ServiceDiscoveryModule, EventModule];

/**
 * Parameters for fetching a widget manifest or configuration.
 */
export type GetWidgetParameters = {
  /** Unique key (name) identifying the widget. */
  widgetKey: string;
  /** Optional version or tag selector for the widget. */
  args?: { type: 'version' | 'tag'; value: string };
};

/**
 * Function that builds a widget API endpoint URL from {@link GetWidgetParameters}.
 */
export type WidgetEndpointBuilder = (args: GetWidgetParameters) => string;

/**
 * Metadata manifest describing a widget’s identity, version, and entry point.
 *
 * Fetched from the backend API during widget initialization.
 */
export type WidgetManifest = {
  /** Unique backend identifier for the widget. */
  id: string;
  /** Human-readable widget name (also used as lookup key). */
  name: string;
  /** Semantic version of the widget. */
  version: string;
  /** Brief description of the widget’s purpose. */
  description: string;
  /** Optional list of maintainer identifiers. */
  maintainers?: string[];
  /** Relative path to the JavaScript entry point (e.g., `index.js`). */
  entryPoint: string;
  /** Base path for widget assets (combined with `entryPoint` to build the import URL). */
  assetPath: string;
};

/**
 * Describes a named endpoint with a URI and optional OAuth scopes.
 */
export type Endpoint = {
  /** Endpoint name. */
  name: string;
  /** Endpoint URI. */
  uri: string;
  /** Optional OAuth scopes required for the endpoint. */
  scopes?: string[];
};

/**
 * Runtime configuration for a widget, including environment variables and
 * backend endpoint mappings.
 *
 * @template TEnvironment - Custom environment shape.
 */
export type WidgetConfig<TEnvironment = unknown> = {
  /** Widget-specific environment variables. */
  environment: TEnvironment;
  /** Map of endpoint names to URIs or structured {@link Endpoint} objects. */
  endpoints: Record<string, string | Endpoint>;
};

/**
 * Combined module set available inside a widget, merging custom modules with
 * the standard {@link EventModule} and {@link ServiceDiscoveryModule}.
 *
 * @template TModules - Additional modules to combine.
 */
export type WidgetModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
  TModules,
  [EventModule, ServiceDiscoveryModule]
>;

/**
 * Generic property bag passed from the host application to a widget render
 * function.
 */
export type WidgetProps = Record<PropertyKey, unknown>;

/**
 * Arguments passed to a widget’s render functions (`renderWidget`, `render`,
 * `renderIcon`, and the default export).
 *
 * @template TFusion - Fusion instance type.
 * @template TEnv - Environment descriptor type.
 * @template TProps - Custom props type.
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
 * Describes the interface a widget script module must export.
 *
 * A dynamically imported widget entry point is expected to expose render
 * functions that mount the widget into a given DOM element and return a
 * cleanup function.
 *
 * @template TProps - Custom props type.
 */
export type WidgetScriptModule<TProps extends WidgetProps = WidgetProps> = {
  /** Default render function (fallback entry point). */
  default: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
  /** Primary render function for the widget body. */
  renderWidget: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
  /** Render function for the widget’s icon representation. */
  renderIcon: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
  /** Generic render function. */
  render: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
};

/**
 * Resolved module instances available inside a running widget.
 *
 * @template TModules - Additional custom modules.
 */
export type WidgetModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
  ModulesInstance<WidgetModules<TModules>>;

/**
 * Internal state managed by a {@link Widget}’s `FlowSubject` state machine.
 *
 * Tracks manifest, config, imported script, framework module instances, and
 * a set of in-flight status markers.
 *
 * @template TModules - Custom module types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetState<TModules = any> = {
  /** Widget name (lookup key). */
  name: string;
  /** Set of in-flight action base types (e.g., `'fetch_manifest'`). */
  status: Set<string>;
  /** Resolved widget configuration (when loaded). */
  config?: WidgetConfig;
  /** Resolved widget manifest (when loaded). */
  manifest?: WidgetManifest;
  /** Imported widget script module (when loaded). */
  modules?: WidgetScriptModule;
  /** Framework module instances created for the widget. */
  instance?: WidgetModulesInstance<TModules>;
};

/**
 * Initial widget state shape passed to the `Widget` constructor.
 *
 * Same as {@link WidgetState} but without the `status` set, which is
 * initialized internally by the reducer.
 */
export type WidgetStateInitial = Omit<WidgetState, 'status'>;
