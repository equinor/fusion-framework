import { Observable, type Subscriber, type Subscription } from 'rxjs';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { TelemetryItem } from './types.js';
import type { TelemetrySource } from './diagnostic-context.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import { mapConfiguratorEvents } from './utils/map-configurator-events.js';
import { TelemetryLevel, TelemetryType } from './static.js';
import { createOperationalRecords } from './create-operational-records.js';

/**
 * Captures safe startup outcomes before telemetry exists, with bounded, single-owner delivery.
 * @internal
 */
export class LifecycleTelemetry {
  #queue: TelemetryItem[] = [];
  #subscriber?: Subscriber<TelemetryItem>;
  #subscription: Subscription;
  #dropped = 0;
  #ended = false;
  #fallback?: ITelemetryProvider;
  /** Immutable origin shared by bootstrap and initialized delivery. */
  readonly source: TelemetrySource;
  #owned = false;
  #relay?: (item: TelemetryItem) => boolean;
  #started = performance.now();
  #hostTerminal = false;
  #fallbackFailureReported = false;
  /** Single-owner startup replay followed by live lifecycle outcomes. */
  readonly items: Observable<TelemetryItem>;

  /**
   * Starts capture immediately, not when the telemetry configurator eventually resolves.
   * @param configurator - Host lifecycle stream.
   * @param source - Source identity captured by the host.
   * @param fallback - Available parent when a child pipeline cannot initialize.
   */
  constructor(
    configurator: Pick<IModulesConfigurator, 'event$'>,
    source: TelemetrySource,
    fallback?: ITelemetryProvider,
  ) {
    this.#fallback = fallback;
    this.source = Object.freeze({ ...source });
    this.items = new Observable((subscriber) => {
      this.#subscriber = subscriber;
      // Release the bounded startup queue exactly once when its provider becomes usable.
      for (const item of this.#queue.splice(0)) {
        subscriber.next(item);
      }
      this.#reportDropped();
      // A host that already ended must not retain a late consumer.
      if (this.#ended) {
        subscriber.complete();
      }
      return () => {
        this.#subscriber = undefined;
        this.#subscription.unsubscribe();
      };
    });
    this.#subscription = mapConfiguratorEvents(configurator, this.source).subscribe({
      next: (item) => {
        // Avoid manufacturing a second host outcome when its terminal record already exists.
        if (item.diagnostic?.module === 'host' && item.diagnostic.operation === 'initialize') {
          this.#hostTerminal = true;
        }
        this.#send(item);
        // A failed startup must not leave pre-provider records stranded indefinitely.
        if (item.name === 'fusion.host.initialize.failure') {
          this.fail();
        }
      },
      error: () => {
        console.warn('Lifecycle telemetry capture failed');
        this.fail();
      },
      complete: () => {
        this.#ended = true;
        this.#subscriber?.complete();
      },
    });
    // Synchronous replay can finish before the subscription field is assigned.
    if (this.#ended) {
      this.#subscription.unsubscribe();
    }
  }

  /** Reports buffered startup outcomes once if the child pipeline never became usable. */
  fail(): void {
    // Host failure callbacks and stream failures may converge on this same capture.
    if (this.#ended) {
      return;
    }
    // Configuration callback errors occur before the module host can emit its own boundary.
    if (!this.#hostTerminal) {
      // Keep the failure duration and sanitized exception together.
      for (const record of createOperationalRecords({
        source: this.source,
        module: 'host',
        operation: 'initialize',
        outcome: 'failure',
        duration: performance.now() - this.#started,
      })) {
        this.#send(record);
      }
    }
    // A usable provider must remain attached through partial-provider cleanup and sink flush.
    if (this.#subscriber) {
      return;
    }
    // Bootstrap failure has no child pipeline; route only the already sanitized bounded queue.
    for (const item of this.#queue.splice(0)) {
      try {
        // Failure recovery must never bypass an explicit relay filter.
        if (this.#relay && !this.#relay(item)) {
          // An intentionally rejected record must not reach a fallback destination.
          continue;
        }
        // Only an available parent can receive startup records before child initialization.
        if (this.#fallback) {
          // Framework parents understand configured ownership, including failed child exporters.
          if (this.#fallback.trackRelayed) {
            this.#fallback.trackRelayed(item, this.#owned);
          } else if (!this.#owned) {
            this.#fallback.track(item);
          } else {
            this.#reportFallbackFailure();
          }
        } else if (item.name === 'fusion.host.initialize.failure') {
          console.warn('Host initialization failed before telemetry became available');
        }
      } catch {
        this.#reportFallbackFailure();
      }
    }
    this.#reportDropped();
    this.#subscription?.unsubscribe();
    this.#ended = true;
  }

  /** Stops capture when configuration explicitly opts out before initialization. */
  stop(): void {
    this.#queue.length = 0;
    this.#subscription.unsubscribe();
    this.#subscriber?.complete();
    this.#ended = true;
  }

  /**
   * Applies explicit routing decisions to startup failure delivery.
   * @param parent - Available ancestor, or undefined for an explicit parent opt-out.
   * @param owned - Whether the child configured an explicit exporter.
   * @param relay - Record-level parent delivery policy.
   */
  configureFallback(
    parent: ITelemetryProvider | undefined,
    owned: boolean,
    relay?: (item: TelemetryItem) => boolean,
  ): void {
    this.#fallback = parent;
    this.#owned = owned;
    this.#relay = relay;
  }

  /**
   * Queues safe terminal records while reserving one slot for an overflow summary.
   * @param item - Sanitized lifecycle record.
   */
  #send(item: TelemetryItem): void {
    // Live delivery avoids retaining records after the provider is ready.
    if (this.#subscriber) {
      this.#subscriber.next(item);
    } else if (this.#queue.length < 255) {
      this.#queue.push(item);
    } else {
      // Prefer failure evidence over successful startup measurements when capacity is exhausted.
      const replace = this.#queue.findIndex((record) => record.level < TelemetryLevel.Error);
      // Replacing only lower-severity entries prevents later successes from evicting failures.
      if (item.level === TelemetryLevel.Error && replace >= 0) {
        this.#queue.splice(replace, 1, item);
      }
      this.#dropped++;
    }
  }

  /** Makes overflow visible without retaining or forwarding dropped payloads. */
  #reportDropped(): void {
    // Quiet startups should not generate extra health traffic.
    if (!this.#dropped) {
      return;
    }
    const item: TelemetryItem = {
      name: 'fusion.telemetry.startup-overflow',
      type: TelemetryType.Event,
      level: TelemetryLevel.Warning,
      properties: { dropped: this.#dropped },
      scope: ['operational'],
      diagnostic: {
        ...this.source,
        schemaVersion: 1,
        module: 'telemetry',
        operation: 'startup-overflow',
        outcome: 'failure',
        occurredAt: Date.now(),
        unit: 'ms',
      },
    };
    this.#dropped = 0;
    // Overflow follows the same live-versus-bootstrap destination as the retained records.
    if (this.#subscriber) {
      this.#subscriber.next(item);
    } else if (this.#fallback) {
      try {
        // A summary is still telemetry and must respect the host's relay opt-out.
        if (this.#relay && !this.#relay(item)) {
          return;
        }
        // Carry ownership so queue overflow cannot activate an inherited fallback exporter.
        if (this.#fallback.trackRelayed) {
          this.#fallback.trackRelayed(item, this.#owned);
        } else if (!this.#owned) {
          this.#fallback.track(item);
        } else {
          console.warn('Startup telemetry queue overflow', item.properties);
        }
      } catch {
        // Local, sanitized health reporting is the last resort when parent delivery itself fails.
        console.warn('Startup telemetry queue overflow', item.properties);
      }
    } else {
      console.warn('Startup telemetry queue overflow', item.properties);
    }
  }

  /** Bounds local health reporting even when every queued fallback delivery fails. */
  #reportFallbackFailure(): void {
    // One unavailable destination must not produce a warning per queued record.
    if (!this.#fallbackFailureReported) {
      this.#fallbackFailureReported = true;
      console.warn('Startup telemetry fallback delivery failed or could not preserve ownership');
    }
  }
}
