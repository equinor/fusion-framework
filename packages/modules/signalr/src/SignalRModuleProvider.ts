import { HubConnectionBuilder, type HubConnection, AbortError } from '@microsoft/signalr';
import { Observable, shareReplay } from 'rxjs';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import {
  TelemetryLevel,
  type ITelemetryProvider,
  type TelemetryConnectable,
} from '@equinor/fusion-framework-module-telemetry';

import type { SignalRConfig } from './SignalRModuleConfigBuilder.js';

import { Topic } from './lib/Topic.js';
import { version } from './version.js';
import { createOperationalTelemetry } from '@equinor/fusion-framework-module-telemetry/utils';

/**
 * Public interface for the SignalR module provider.
 *
 * Use {@link ISignalRProvider.connect} to subscribe to a named hub method
 * through an RxJS-based {@link Topic}. Connections are reference-counted
 * and automatically torn down when all subscribers unsubscribe.
 */
export interface ISignalRProvider extends TelemetryConnectable {
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
 *
 * Extends {@link BaseModuleProvider} so the module configurator recognises it
 * as a standard provider and can report the package `version`.
 */
export class SignalRModuleProvider
  extends BaseModuleProvider<SignalRConfig>
  implements ISignalRProvider
{
  #config: SignalRConfig;
  #hubConnections: Record<string, Observable<HubConnection>> = {};

  /**
   * Creates a SignalR provider for the hubs registered in the configurator.
   *
   * @param config - Resolved SignalR configuration containing all registered hubs
   */
  constructor(config: SignalRConfig) {
    super({ version, config });
    this.#config = config;
    this._addTeardown(() => this.#telemetry.disconnect());
  }

  #telemetry = createOperationalTelemetry('signalr');

  /**
   * Connects optional operational telemetry for hub connection lifecycles.
   *
   * Records `fusion.signalr.connect.duration`, `reconnect.duration` and
   * `disconnect.duration` outcomes, plus a `connection-lost` notification when a
   * connection closes unexpectedly. Teardown during start is `cancelled`, not a failure.
   * Hub names, URLs, tokens and messages are never recorded.
   *
   * @param telemetry - Host telemetry provider, or `undefined` to record nothing.
   */
  public connectTelemetry(telemetry: ITelemetryProvider | undefined): void {
    this.#telemetry.connect(telemetry);
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

    // Reuse an already-established connection observable for this hub
    if (hubId in this.#hubConnections) {
      return this.#hubConnections[hubId];
    }
    const config = this.#config.hubs[hubId];
    // Fail loudly when the hub was never registered with the configurator
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
      // Lifecycle state classifies close callbacks; it never changes connection behavior.
      let connected = false;
      let stopping = false;
      let reconnectStarted: number | undefined;

      connection.onreconnecting(() => {
        reconnectStarted = performance.now();
      });
      connection.onreconnected(() => {
        // Only reconnects observed from their start have a measurable duration.
        if (reconnectStarted !== undefined) {
          this.#telemetry.report({
            operation: 'reconnect',
            outcome: 'success',
            duration: performance.now() - reconnectStarted,
          });
          reconnectStarted = undefined;
        }
      });
      connection.onclose(() => {
        // A close while reconnecting ends that reconnect attempt.
        if (reconnectStarted !== undefined) {
          this.#telemetry.report({
            operation: 'reconnect',
            outcome: stopping ? 'cancelled' : 'failure',
            duration: performance.now() - reconnectStarted,
          });
          reconnectStarted = undefined;
        } else if (connected && !stopping) {
          // Teardown is the only intentional stop, so any other close of an established
          // connection is a loss, including a graceful server close without an error.
          this.#telemetry.report({
            notification: true,
            operation: 'connection-lost',
            outcome: 'failure',
            level: TelemetryLevel.Error,
          });
        }
        connected = false;
      });

      const connectStarted = performance.now();
      connection
        .start()
        .then(() => {
          // A start that settles after teardown was cancelled; the observer is already complete.
          if (stopping) {
            this.#telemetry.report({
              operation: 'connect',
              outcome: 'cancelled',
              duration: performance.now() - connectStarted,
            });
            return;
          }
          connected = true;
          this.#telemetry.report({
            operation: 'connect',
            outcome: 'success',
            duration: performance.now() - connectStarted,
          });
          observer.next(connection);
        })
        .catch((error: unknown) => {
          // Teardown during start is an expected cancellation, not a failure.
          this.#telemetry.report({
            operation: 'connect',
            outcome: error instanceof AbortError || stopping ? 'cancelled' : 'failure',
            duration: performance.now() - connectStarted,
          });
          // Swallow expected teardown aborts; re-throw anything else
          if (error instanceof AbortError) {
            // AbortError is expected during teardown — safe to ignore
          } else {
            throw error;
          }
        });

      // Stop the connection and clean up the cache entry on unsubscribe
      const teardown = () => {
        stopping = true;
        const wasConnected = connected;
        const stopStarted = performance.now();
        const stopped = connection.stop();
        // Disconnect is measured only for established connections; a pending start is
        // reported as a cancelled connect instead.
        if (wasConnected) {
          stopped?.then(
            () =>
              this.#telemetry.report({
                operation: 'disconnect',
                outcome: 'success',
                duration: performance.now() - stopStarted,
              }),
            (error: unknown) => {
              this.#telemetry.report({
                operation: 'disconnect',
                outcome: 'failure',
                duration: performance.now() - stopStarted,
              });
              // Observing the failure must not hide it from existing rejection handling.
              throw error;
            },
          );
        }
        observer.complete();
        delete this.#hubConnections[hubId];
      };

      return teardown;
    })
      // Share a single connection across subscribers and tear it down when unused
      .pipe(
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
