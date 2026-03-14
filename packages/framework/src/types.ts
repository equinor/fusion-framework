import type { CombinedModules, ModulesInstance } from '@equinor/fusion-framework-module';
import type { AnyModule } from '@equinor/fusion-framework-module';

import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import type { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

/**
 * Union of all built-in Fusion Framework module descriptors, optionally
 * combined with additional custom modules.
 *
 * Use this type to describe the full set of modules the framework
 * configurator will manage. The built-in set includes:
 * - {@link ContextModule} — application/project context selection
 * - {@link EventModule} — cross-module event bus
 * - {@link HttpModule} — HTTP client factory
 * - {@link MsalModule} — Microsoft Authentication Library integration
 * - {@link ServicesModule} — typed service clients
 * - {@link ServiceDiscoveryModule} — runtime service endpoint resolution
 * - {@link TelemetryModule} — telemetry and logging
 *
 * @template TModules - Additional module descriptors to merge with the
 *   built-in modules. Defaults to `unknown` (no extra modules).
 */
export type FusionModules<TModules extends Array<AnyModule> | unknown = unknown> = CombinedModules<
  TModules,
  [
    ContextModule,
    EventModule,
    HttpModule,
    MsalModule,
    ServicesModule,
    ServiceDiscoveryModule,
    TelemetryModule,
  ]
>;

/**
 * Resolved instance map for all Fusion Framework modules.
 *
 * This is the runtime counterpart of {@link FusionModules}: after the
 * framework has been initialized with {@link init}, every module
 * descriptor is replaced by its live instance (clients, providers,
 * managers, etc.).
 *
 * @template TModules - Additional module descriptors whose instances
 *   should be included. Defaults to `unknown`.
 */
export type FusionModulesInstance<TModules extends Array<AnyModule> | unknown = unknown> =
  ModulesInstance<FusionModules<TModules>>;

/**
 * Root object returned by {@link init} after bootstrapping the framework.
 *
 * The `Fusion` object is also assigned to `window.Fusion` so that portal
 * shells, micro-frontends, and widgets can access the running framework
 * instance globally.
 *
 * @template TModules - Additional module descriptors beyond the built-in
 *   set. Defaults to `unknown`.
 */
export interface Fusion<TModules extends Array<AnyModule> | unknown = unknown> {
  /** Map of all initialized module instances keyed by module name. */
  modules: FusionModulesInstance<TModules>;
}

/**
 * Callback signature for rendering a Fusion application into a DOM element.
 *
 * Portal hosts call this function when mounting an application, passing the
 * root element and a reference to the host's module instances so the
 * application can share authentication, HTTP clients, and other services.
 *
 * @param el - The DOM element into which the application should render.
 * @param args - Initialization arguments containing a reference to the
 *   host framework's module instances.
 */
export type FusionRenderFn = (el: HTMLElement, args: { ref: ModulesInstance<AnyModule[]> }) => void;
