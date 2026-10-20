import { Observable, Subject, type Subscription } from 'rxjs';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { TelemetryItem } from '../types.js';
import type { TelemetrySource } from '../schemas/diagnostic-context.js';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import { TelemetryLevel, TelemetryType } from '../static.js';
import { mapConfiguratorEvents } from '../utils/map-configurator-events.js';
import { createOperationalRecords } from '../utils/create-operational-records.js';
import { createDiagnosticContext } from '../utils/create-diagnostic-context.js';
import { operationalScope } from '../utils/operational-scope.js';
import { relayRecord } from '../utils/relay-record.js';
import { StartupBuffer } from './StartupBuffer.js';

/** Host identity and recovery target, the same values the host sets on its telemetry configurator. */
export interface StartupCaptureOptions {
  /** Host identity stamped on every captured record; unclassified when omitted. */
  source?: TelemetrySource;
  /** Ancestor receiving startup records if startup fails before a provider exists. */
  parent?: ITelemetryProvider;
}

/**
 * Captures safe host lifecycle outcomes from before any telemetry provider exists.
 *
 * Telemetry is itself a module, so it cannot observe the startup it is part of. A host creates
 * a capture as soon as it is configured, before any user code runs, and attaches its
 * {@link items} to the telemetry configurator with `attachLifecycleItems`. The capture:
 * - buffers sanitized terminal records (bounded, failures preferred) until the provider
 *   consumes {@link items}, then forwards live;
 * - when startup fails before any provider exists, hands the buffer to the host's parent,
 *   creating the host failure record when the host never emitted one (for example, a failing
 *   host configuration callback). The child's exporters and relay filter are not known yet,
 *   so recovery relays without ownership; nothing is dropped.
 *
 * @example
 * ```ts
 * const source = { source: 'portal', hostId: crypto.randomUUID() };
 * const capture = new StartupCapture(configurator, { source, parent });
 * configurator.addConfig({
 *   module: telemetryModule,
 *   prepare: (builder) => builder.setSource(source).setParent(parent).attachLifecycleItems(capture.items),
 * });
 * try {
 *   await configureHost(configurator);
 * } catch (error) {
 *   capture.fail();
 *   throw error;
 * }
 * ```
 */
export class StartupCapture {
  /** Startup records followed by live outcomes, for the provider that consumes the capture. */
  readonly items: Observable<TelemetryItem>;

  #options: Required<Pick<StartupCaptureOptions, 'source'>> & StartupCaptureOptions;
  #buffer = new StartupBuffer();
  #live = new Subject<TelemetryItem>();
  /** Buffering until a provider consumes, then live; closed once nothing more is captured. */
  #status: 'capturing' | 'live' | 'closed' = 'capturing';
  /** The host reported its own initialize outcome, so a failure must not create another. */
  #hostReported = false;
  #subscription: Subscription;
  readonly #startedAt = performance.now();

  /**
   * Starts capture immediately, not when the telemetry configuration eventually resolves.
   * @param host - Host lifecycle stream.
   * @param options - Host identity and the parent receiving records if startup fails.
   */
  constructor(host: Pick<IModulesConfigurator, 'event$'>, options: StartupCaptureOptions = {}) {
    this.#options = { ...options, source: options.source ?? { hostId: crypto.randomUUID() } };
    this.items = new Observable((subscriber) => {
      // Join live delivery first, so nothing captured while the buffer drains is lost.
      const live = this.#live.subscribe(subscriber);
      const closed = this.#status === 'closed';
      // A capture that already closed stays closed; an active one now forwards live.
      if (!closed) {
        this.#status = 'live';
      }
      const { items, dropped } = this.#buffer.drain();
      // Release the bounded startup buffer exactly once, to the provider that consumes it.
      for (const item of items) {
        subscriber.next(item);
      }
      // Overflow is reported once, alongside the records that survived it.
      if (dropped) {
        subscriber.next(this.#overflowSummary(dropped));
      }
      // A late consumer of a closed capture receives the buffer and nothing more.
      if (closed) {
        subscriber.complete();
      }
      return () => {
        live.unsubscribe();
        this.#close();
      };
    });
    this.#subscription = mapConfiguratorEvents(host, this.#options.source).subscribe({
      next: (item) => {
        this.#capture(item);
        // Recover synchronously: a host rolling back completes its stream right after this record.
        if (item.name === 'fusion.host.initialize.failure') {
          this.fail();
        }
      },
      error: () => {
        console.warn('Startup telemetry capture failed');
        this.fail();
      },
      complete: () => {
        // Keep the buffer: a provider created after completion may still drain it.
        this.#status = 'closed';
        this.#live.complete();
      },
    });
    // Synchronous replay can close capture before the subscription is assigned.
    if (this.#status === 'closed') {
      this.#subscription.unsubscribe();
    }
  }

  /** Reports buffered startup outcomes once if no provider ever consumed the capture. */
  fail(): void {
    // Host failure callbacks and stream failures may converge on this same capture.
    if (this.#status === 'closed') {
      return;
    }
    // Configuration callback errors occur before the module host can emit its own boundary.
    if (!this.#hostReported) {
      // Keep the failure duration and sanitized exception together.
      for (const record of createOperationalRecords({
        source: this.#options.source,
        module: 'host',
        operation: 'initialize',
        outcome: 'failure',
        duration: performance.now() - this.#startedAt,
      })) {
        this.#capture(record);
      }
    }
    // An attached provider keeps its records through partial cleanup and sink flush.
    if (this.#status === 'live') {
      return;
    }
    const { items, dropped } = this.#buffer.drain();
    this.#close();
    this.#recover(items, dropped);
  }

  /** Stops capture when configuration explicitly opts out before initialization. */
  stop(): void {
    this.#buffer.drain();
    this.#close();
  }

  /**
   * Records one sanitized record: buffered until a provider consumes, then forwarded live.
   * @param item - Sanitized lifecycle record.
   */
  #capture(item: TelemetryItem): void {
    // Avoid manufacturing a second host outcome once the host reported its own.
    if (item.diagnostic?.module === 'host' && item.diagnostic.operation === 'initialize') {
      this.#hostReported = true;
    }
    // Live delivery avoids retaining records after the provider is ready.
    if (this.#status === 'live') {
      this.#live.next(item);
    } else if (this.#status === 'capturing') {
      this.#buffer.push(item);
    }
  }

  /** Ends capture: releases the host subscription and completes live delivery. */
  #close(): void {
    this.#status = 'closed';
    this.#subscription?.unsubscribe();
    this.#live.complete();
  }

  /**
   * Hands buffered startup records to the parent after startup failed before a provider existed.
   * @param items - Records retained before recovery.
   * @param dropped - Records discarded at capacity.
   */
  #recover(items: TelemetryItem[], dropped: number): void {
    const { parent } = this.#options;
    let fallbackFailureReported = false;
    // Route only the already sanitized, bounded buffer.
    for (const item of items) {
      // Delivered or intentionally filtered records need no local fallback.
      if (this.#relayToParent(item)) {
        // Move on to the next buffered record.
        continue;
      }
      // A parent that cannot honour ownership is reported once, not once per record.
      if (parent && !fallbackFailureReported) {
        fallbackFailureReported = true;
        console.warn('Startup telemetry fallback delivery failed or could not preserve ownership');
      } else if (!parent && item.name === 'fusion.host.initialize.failure') {
        console.warn('Host initialization failed before telemetry became available');
      }
    }
    // Make overflow visible without retaining or forwarding dropped payloads.
    if (dropped) {
      const summary = this.#overflowSummary(dropped);
      // Local, sanitized health reporting is the last resort when no parent can take it.
      if (!this.#relayToParent(summary)) {
        console.warn('Startup telemetry queue overflow', summary.properties);
      }
    }
  }

  /**
   * Delivers one startup record to the host's parent.
   * @param item - Sanitized startup record.
   * @returns Whether the record was delivered or intentionally filtered.
   */
  #relayToParent(item: TelemetryItem): boolean {
    const { parent } = this.#options;
    // Without a parent there is nowhere to recover to.
    if (!parent) {
      return false;
    }
    try {
      // The child's exporters are not configured yet, so it cannot claim ownership.
      return relayRecord(parent, item, { ownsExport: false });
    } catch {
      // Parent delivery failures fall through to local health reporting.
      return false;
    }
  }

  /**
   * Creates the summary standing in for records dropped at startup capacity.
   * @param dropped - Number of records discarded.
   * @returns A safe overflow event carrying only the dropped count.
   */
  #overflowSummary(dropped: number): TelemetryItem {
    const { source } = this.#options;
    return {
      name: 'fusion.telemetry.startup-overflow',
      type: TelemetryType.Event,
      level: TelemetryLevel.Warning,
      properties: { dropped },
      // Scope the summary like the records it stands in for.
      scope: operationalScope(source),
      diagnostic: createDiagnosticContext({
        source,
        module: 'telemetry',
        operation: 'startup-overflow',
        outcome: 'failure',
      }),
    };
  }
}

export default StartupCapture;
