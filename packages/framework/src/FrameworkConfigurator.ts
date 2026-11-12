import {
  type AnyModule,
  type CombinedModules,
  type ModulesConfig,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';

import http, {
  configureHttpClient,
  configureHttp,
  type HttpClientOptions,
} from '@equinor/fusion-framework-module-http';
import type { HttpClientMsal } from '@equinor/fusion-framework-module-http/client';

import auth, { type AuthConfigFn } from '@equinor/fusion-framework-module-msal';

import context from '@equinor/fusion-framework-module-context';

import disco from '@equinor/fusion-framework-module-service-discovery';
import services from '@equinor/fusion-framework-module-services';
import telemetry, {
  enableTelemetry,
  StartupCapture,
  TelemetryConfigurator,
  type ITelemetryConfigurator,
} from '@equinor/fusion-framework-module-telemetry';

import { connectHttpTelemetry, type HostHttpTelemetry } from './connect-http-telemetry.js';
import type { FusionModules } from './types.js';
import type { MsalClientConfig } from '@equinor/fusion-framework-module-msal';
import { version } from './version.js';

/**
 * Options for creating a {@link FrameworkConfigurator}.
 */
export interface FrameworkConfiguratorOptions {
  /**
   * Telemetry configuration builder the framework host should configure, for example a
   * mock builder in tests. Defaults to a new `TelemetryConfigurator`.
   */
  telemetry?: ITelemetryConfigurator;
  /**
   * Records one safe `fusion.http.request.duration` metric per transport attempt of the
   * framework's HTTP clients, plus a sanitized failure on error. Defaults to `true`; set
   * `false` to keep framework HTTP traffic out of operational telemetry.
   */
  httpTelemetry?: boolean;
}

/**
 * Configurator that registers and wires the core Fusion Framework modules.
 *
 * Extend `FrameworkConfigurator` to declare which modules (authentication,
 * HTTP, service-discovery, telemetry, context, …) the framework instance
 * should contain and how each module is configured before the framework
 * starts.
 *
 * Typical workflow:
 * 1. Create a `FrameworkConfigurator` instance.
 * 2. Call configuration helpers such as {@link configureMsal},
 *    {@link configureHttp}, {@link configureHttpClient}, and
 *    {@link configureServiceDiscovery}.
 * 3. Pass the configurator to {@link init} to bootstrap the framework.
 *
 * @template TModules - Additional module descriptors to merge with the
 *   built-in Fusion modules.
 * @template TRef - Optional reference object forwarded to module
 *   initialization (e.g. a parent framework instance).
 *
 * @example
 * ```typescript
 * import { FrameworkConfigurator, init } from '@equinor/fusion-framework';
 *
 * const configurator = new FrameworkConfigurator();
 * configurator.configureMsal({ clientId: 'my-client-id', authority: '…' });
 * configurator.configureServiceDiscovery({
 *   client: { baseUri: 'https://service-registry.example.com' },
 * });
 *
 * const fusion = await init(configurator);
 * ```
 */
export class FrameworkConfigurator<
  TModules extends Array<AnyModule> = [],
  // biome-ignore lint/suspicious/noExplicitAny: default must be bivariant `any`, not `unknown` \u2014 `unknown` breaks assignability when a concrete `FrameworkConfigurator<TModules, TRef>` is used where the default-typed class is expected
  TRef = any,
> extends ModulesConfigurator<FusionModules<TModules>, TRef> {
  /**
   * The class name used for event naming. This static property ensures
   * the name is preserved through compilation and minification.
   */
  static readonly className: string = 'FrameworkConfigurator';

  /**
   * Creates a new FrameworkConfigurator instance with default telemetry configuration.
   *
   * Initializes the framework with core modules (event, auth, http, service discovery,
   * services, context, and telemetry) and sets up default telemetry that includes
   * framework version metadata and 'framework' scope for all telemetry events.
   * @param options - Optional host setup; see {@link FrameworkConfiguratorOptions}.
   *
   * @example
   * ```typescript
   * const configurator = new FrameworkConfigurator();
   * // Now ready to configure additional modules
   * ```
   */
  constructor(options?: FrameworkConfiguratorOptions) {
    super([event, auth, http, disco, services, context, telemetry]);

    const source = { source: 'framework', hostId: crypto.randomUUID() };
    // Capture startup before any configuration code runs; the framework is the root host.
    const capture = new StartupCapture(this, { source });
    const builder = (options?.telemetry ?? new TelemetryConfigurator())
      .setSource(source)
      .setMetadata({
        fusion: {
          type: 'framework-telemetry',
          framework: {
            version,
          },
        },
      })
      .setDefaultScope(['framework'])
      .attachLifecycleItems(capture.items);
    this.addConfig({
      module: telemetry,
      configurator: builder,
    });
    // Explicit opt-out only; HTTP telemetry never creates an exporter by itself.
    if (options?.httpTelemetry !== false) {
      this.#httpTelemetry = connectHttpTelemetry(this);
    }
  }

  /** Framework HTTP telemetry, installed once every configuration callback has settled. */
  #httpTelemetry?: HostHttpTelemetry;

  /**
   * Configures modules, then installs HTTP telemetry as the innermost middleware.
   *
   * Post-configure callbacks run concurrently, so installing after the whole configure phase
   * is the only point where every application middleware, including retry middleware added
   * from asynchronous callbacks, is already registered.
   *
   * @param ref - Optional reference forwarded to module configuration.
   * @returns The final module configuration map.
   * @template T - Additional modules included in the configuration type.
   * @template R - Reference type forwarded to module configuration.
   */
  protected override async _configure<T, R extends TRef = TRef>(
    ref?: R,
  ): Promise<ModulesConfig<CombinedModules<T, FusionModules<TModules>>>> {
    const config = await super._configure<T, R>(ref);
    this.#httpTelemetry?.install(config);
    return config;
  }

  /**
   * Configures the global HTTP module settings such as base URLs, default headers,
   * request/response interceptors, and timeout settings.
   *
   * This affects all HTTP requests made through the framework's HTTP module.
   * Use this for application-wide HTTP configuration.
   *
   * @param args - HTTP module configuration arguments (same as configureHttp function)
   *
   * @example
   * ```typescript
   * configurator.configureHttp({
   *   baseUri: 'https://api.example.com',
   *   defaultHeaders: { 'X-App-Version': '1.0.0' }
   * });
   * ```
   */
  public configureHttp(...args: Parameters<typeof configureHttp>) {
    this.addConfig(configureHttp(...args));
  }

  /**
   * Configures a named HTTP client instance with specific settings.
   *
   * Unlike configureHttp which sets global HTTP settings, this creates a named client
   * that can have its own base URL, headers, interceptors, and other HTTP-specific
   * configuration. Useful for connecting to different APIs or services with different requirements.
   *
   * @param args - HTTP client configuration arguments: [name, clientOptions]
   *               where name is a string identifier and clientOptions contains HTTP settings
   *
   * @example
   * ```typescript
   * // Configure a client for external API
   * configurator.configureHttpClient('external-api', {
   *   baseUri: 'https://external-api.com',
   *   defaultHeaders: { 'Authorization': 'Bearer token' }
   * });
   *
   * // Configure a client for internal services
   * configurator.configureHttpClient('internal', {
   *   baseUri: 'https://internal.company.com',
   *   timeout: 10000
   * });
   * ```
   */
  public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
    this.addConfig(configureHttpClient(...args));
  }

  /**
   * Configures Microsoft Authentication Library (MSAL) authentication for the framework.
   *
   * This sets up OAuth 2.0 / OpenID Connect authentication using Azure AD or other
   * MSAL-compatible identity providers. The authentication module will handle token
   * acquisition, refresh, and user session management.
   *
   * @param cb_or_config - Authentication configuration. Can be either:
   *                      - A callback function that receives an auth builder for advanced configuration
   *                      - A client configuration object with MSAL settings
   * @param requiresAuth - Whether the application requires authentication to function.
   *                      When true (default), unauthenticated users cannot access the app.
   *                      When false, authentication is optional but available when needed.
   *
   * @example
   * ```typescript
   * // Simple configuration with client config object
   * configurator.configureMsal({
   *   clientId: 'your-client-id',
   *   authority: 'https://login.microsoftonline.com/your-tenant-id'
   * });
   *
   * // Advanced configuration with callback
   * configurator.configureMsal((builder) => {
   *   builder.setClientConfig({
   *     clientId: 'your-client-id',
   *     authority: 'https://login.microsoftonline.com/your-tenant-id'
   *   });
   *   builder.setScopes(['User.Read', 'api://your-api/scope']);
   *   builder.setRequiresAuth(true);
   * });
   *
   * // Optional authentication
   * configurator.configureMsal(config, false);
   * ```
   */
  public configureMsal(cb_or_config: AuthConfigFn | MsalClientConfig, requiresAuth = true) {
    this.addConfig({
      module: auth,
      configure: (builder) => {
        // Only override the default requiresAuth flag when the caller explicitly set one
        if (requiresAuth !== undefined) {
          builder.setRequiresAuth(!!requiresAuth);
        }
        // A function argument configures the builder directly
        if (typeof cb_or_config === 'function') {
          cb_or_config(builder);
        }
        // A plain object argument is applied as the MSAL client config
        if (typeof cb_or_config === 'object') {
          builder.setClientConfig(cb_or_config);
        }
      },
    });
  }

  /**
   * Configures the service discovery module to automatically find and connect to services.
   *
   * Service discovery allows the framework to dynamically locate microservices and APIs
   * at runtime rather than hardcoding their URLs. This is essential in distributed systems
   * where services may be deployed across multiple environments or scaled dynamically.
   *
   * @param args - Configuration object for service discovery
   * @param args.client - HTTP client configuration used to communicate with the
   *                     service discovery registry. Typically includes base URL,
   *                     authentication, and timeout settings.
   *
   * @example
   * ```typescript
   * configurator.configureServiceDiscovery({
   *   client: {
   *     baseUri: 'https://service-registry.company.com',
   *     defaultHeaders: { 'Authorization': 'Bearer token' },
   *     timeout: 5000
   *   }
   * });
   * ```
   */
  public configureServiceDiscovery(args: { client: HttpClientOptions<HttpClientMsal> }) {
    this.configureHttpClient('service_discovery', args.client);
  }

  /**
   * Configures application telemetry and observability settings.
   *
   * Telemetry enables tracking of application usage, performance metrics, errors,
   * and custom events. This helps with monitoring, debugging, and understanding
   * how your application is being used. The framework comes with default telemetry
   * that includes framework version and scope information.
   *
   * @param cb - Configuration callback function that receives a telemetry builder.
   *             Use this to customize telemetry settings like event scopes, metadata,
   *             sampling rates, and custom instrumentation.
   *
   * @example
   * ```typescript
   * configurator.configureTelemetry((builder) => {
   *   // Add custom metadata to all telemetry events
   *   builder.setMetadata({
   *     application: 'my-app',
   *     environment: 'production',
   *     version: '1.2.3'
   *   });
   *
   *   // Set custom scopes for filtering events
   *   builder.setDefaultScope(['app', 'performance']);
   *
   *   // Configure sampling (only send 10% of events)
   *   builder.setSamplingRate(0.1);
   *
   *   // Add custom instrumentation
   *   builder.addInstrumentation('custom-operation', (context) => {
   *     // Track custom metrics
   *   });
   * });
   * ```
   */
  public configureTelemetry(cb: Parameters<typeof enableTelemetry>[1]): void {
    enableTelemetry(this, cb);
  }
}

export default FrameworkConfigurator;
