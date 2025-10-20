import {
  type AnyModule,
  ModulesConfigurator,
  type ModuleEvent,
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
import telemetry, { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';

import type { FusionModules } from './types.js';
import type { MsalClientConfig } from '@equinor/fusion-framework-module-msal';
import { version } from './version.js';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

/**
 * Module configurator for Framework modules
 * @template TModules - Addition modules
 * @template TRef - usually undefined, optional references
 */
export class FrameworkConfigurator<
  TModules extends Array<AnyModule> = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
   *
   * @example
   * ```typescript
   * const configurator = new FrameworkConfigurator();
   * // Now ready to configure additional modules
   * ```
   */
  constructor() {
    super([event, auth, http, disco, services, context, telemetry]);

    // default configuration
    enableTelemetry(this, {
      configure: (builder) => {
        builder.setMetadata({
          fusion: {
            type: 'framework-telemetry',
            framework: {
              version,
            },
          },
        });
        builder.setDefaultScope(['framework']);
      },
    });
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
        if (requiresAuth !== undefined) {
          builder.setRequiresAuth(!!requiresAuth);
        }
        if (typeof cb_or_config === 'function') {
          cb_or_config(builder);
        }
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
