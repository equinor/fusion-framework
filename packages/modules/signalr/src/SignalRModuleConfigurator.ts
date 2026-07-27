import { type AnyModule, ModuleConfigBuilder } from '@equinor/fusion-framework-module';

import type { IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';

/**
 * Public configuration interface for the SignalR module.
 *
 * Consumers use this interface to register hub connections and configuration
 * callbacks during the module `configure` phase.
 */
export interface ISignalRConfigurator {
  /**
   * Register a named SignalR hub connection.
   *
   * @param name - Unique identifier for the hub (used later with {@link ISignalRProvider.connect})
   * @param config - Hub connection configuration or a promise that resolves to one
   */
  addHub(name: string, config: SignalRHubConfig | Promise<SignalRHubConfig>): void;

  /**
   * Register a callback that will run during the module initialization phase
   * to build configuration using a {@link SignalRModuleConfigBuilder}.
   *
   * Use this when hub configuration depends on resolved module dependencies
   * such as service-discovery or authentication.
   *
   * @param cb - Callback that receives a {@link SignalRModuleConfigBuilder}
   */
  onCreateConfig(cb: SignalRModuleConfigBuilderCallback): void;
}

/**
 * Callback invoked during module initialization to configure SignalR hubs.
 *
 * Receives a {@link SignalRModuleConfigBuilder} that provides access to
 * resolved module dependencies, allowing dynamic hub registration.
 *
 * @template TDeps - Tuple of module dependencies available through the builder
 */
export type SignalRModuleConfigBuilderCallback<TDeps = unknown> = (
  builder: SignalRModuleConfigBuilder<TDeps>,
) => void | Promise<void>;

/**
 * Configuration for a single SignalR hub connection.
 *
 * Defines the endpoint URL, transport options, reconnection behavior,
 * and logging level for a `@microsoft/signalr` `HubConnection`.
 */
export type SignalRHubConfig = {
  /** Absolute URL of the SignalR hub endpoint. */
  url: string;

  /**
   * Transport and authentication options forwarded to the underlying
   * `HubConnectionBuilder.withUrl()` call.
   *
   * The `httpClient` option is excluded because the module manages the
   * HTTP client internally.
   */
  options: Omit<IHttpConnectionOptions, 'httpClient'>;

  /**
   * When `true`, the connection will automatically attempt to reconnect
   * after an unintentional disconnection.
   *
   * @defaultValue `undefined` (no automatic reconnect)
   */
  automaticReconnect?: boolean;

  /**
   * Minimum log level for the SignalR connection logger.
   *
   * @defaultValue `LogLevel.Critical` (5) when omitted
   */
  logLevel?: LogLevel;
};

/**
 * Resolved configuration used to create a {@link SignalRModuleProvider}.
 *
 * Contains all registered hub configurations keyed by hub name.
 */
export type SignalRConfig = {
  /** Map of hub name to its {@link SignalRHubConfig}. */
  hubs: Record<string, SignalRHubConfig>;
};

/**
 * Builder utility for registering SignalR hub configurations during
 * module initialization.
 *
 * Extends {@link ModuleConfigBuilder} to provide access to resolved
 * module dependencies (e.g., service-discovery, authentication) so that
 * hub URLs and access-token factories can be built dynamically.
 *
 * @template TDeps - Tuple of module dependencies available through the builder
 */
export class SignalRModuleConfigBuilder<
  TDeps extends AnyModule[] | unknown = unknown,
  // TODO(#5096): use BaseConfigBuilder
> extends ModuleConfigBuilder<TDeps, ISignalRConfigurator> {
  /**
   * Register a named hub connection through the underlying configurator.
   *
   * @param name - Unique hub identifier
   * @param config - Hub connection configuration
   */
  async addHub(name: string, config: SignalRHubConfig) {
    this._config.addHub(name, config);
  }
}
