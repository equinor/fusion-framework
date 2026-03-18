import { HubConnectionBuilder, type HubConnection, AbortError } from '@microsoft/signalr';
import { Observable, shareReplay } from 'rxjs';

import type { SignalRConfig } from './SignalRModuleConfigurator';

import { Topic } from './lib/Topic';

/**
 * Public interface for the SignalR module provider.
 *
 * Use {@link ISignalRProvider.connect} to subscribe to a named hub method
 * through an RxJS-based {@link Topic}. Connections are reference-counted
 * and automatically torn down when all subscribers unsubscribe.
 */
export interface ISignalRProvider {
  /**
   * Connect to a SignalR hub method and return an observable {@link Topic}.
   *
   * Existing hub connections are reused (shared via `shareReplay` with
   * `refCount`). When the last subscriber unsubscribes, the underlying
   * `HubConnection` is stopped automatically.
   *
   * @template T - Type of messages received from the hub method
   * @param hubId - Name of the hub as registered in the configurator
   * @param methodName - Server-side method name to listen on
   * @returns A {@link Topic} observable that emits messages from the hub method
   *
   * @example
   * ```ts
   * const provider = modules.signalR;
   * const topic = provider.connect<MyMessage>('notifications', 'OnNewMessage');
   * topic.subscribe((msg) => console.log('Received:', msg));
   * ```
   */
  connect<T>(hubId: string, methodName: string): Topic<T>;
}

/**
 * Default {@link ISignalRProvider} implementation.
 *
 * Creates and manages `@microsoft/signalr` `HubConnection` instances based on
 * the resolved {@link SignalRConfig}. Hub connections are lazily created on
 * first subscription and shared across all callers via `shareReplay`.
 */
export class SignalRModuleProvider implements ISignalRProvider {
  #config: SignalRConfig;
  #hubConnections: Record<string, Observable<HubConnection>> = {};

  /**
   * @param config - Resolved SignalR configuration containing all registered hubs
   */
  constructor(config: SignalRConfig) {
    this.#config = config;
  }

  /**
   * Connect to a named hub method and return an observable {@link Topic}.
   *
   * @template T - Type of messages received from the hub method
   * @param hubId - Name of the hub as registered in the configurator
   * @param methodName - Server-side method name to listen on
   * @returns A {@link Topic} observable emitting hub messages
   * @throws {Error} When no hub configuration exists for `hubId`
   */
  public connect<T>(hubId: string, methodName: string): Topic<T> {
    return new Topic<T>(methodName, this._createHubConnection(hubId));
  }

  /**
   * Create or retrieve a shared `HubConnection` observable for the given hub.
   *
   * The connection is lazily built using `HubConnectionBuilder` and shared
   * with `shareReplay({ bufferSize: 1, refCount: true })` so that:
   * - New subscribers immediately receive the current connection.
   * - The connection is stopped when the last subscriber unsubscribes.
   *
   * @param hubId - Name of the hub as registered in the configurator
   * @returns Observable that emits the active `HubConnection`
   * @throws {Error} When no hub configuration exists for `hubId`
   */
  protected _createHubConnection(hubId: string): Observable<HubConnection> {
    const LOG_LEVEL_CRITICAL = 5;

    if (hubId in this.#hubConnections) {
      return this.#hubConnections[hubId];
    }
    const config = this.#config.hubs[hubId];
    if (!config) {
      throw Error(`could not find any configuration for hub [${hubId}]`);
    }

    this.#hubConnections[hubId] = new Observable<HubConnection>((observer) => {
      const builder = new HubConnectionBuilder().withUrl(config.url, {
        ...config.options,
      });

      config.automaticReconnect && builder.withAutomaticReconnect();

      builder.configureLogging(config.logLevel || LOG_LEVEL_CRITICAL);

      const connection = builder.build();

      connection
        .start()
        .then(() => {
          observer.next(connection);
        })
        .catch((error: unknown) => {
          if (error instanceof AbortError) {
            // AbortError is expected during teardown — safe to ignore
          } else {
            throw error;
          }
        });

      // Stop the connection and clean up the cache entry on unsubscribe
      const teardown = () => {
        connection.stop();
        observer.complete();
        delete this.#hubConnections[hubId];
      };

      return teardown;
    }).pipe(
      shareReplay({
        /** only emit last connection when new subscriber connects */
        bufferSize: 1,
        /** when no subscribers, teardown observable */
        refCount: true,
      }),
    );

    return this.#hubConnections[hubId];
  }
}

export default SignalRModuleProvider;
