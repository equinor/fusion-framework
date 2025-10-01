import type { TelemetryItem } from './types.js';

/**
 * Represents an adapter for processing telemetry items.
 *
 * Implementations of this interface are responsible for handling telemetry data
 * and are identified by a unique string identifier.
 *
 * @property identifier - A unique string that identifies the telemetry adapter.
 * @method processItem - Processes a given telemetry item.
 * @param item - The telemetry item to be processed.
 */
export interface TelemetryAdapter {
  readonly identifier: string;
  processItem(item: TelemetryItem): void;
}

/**
 * Abstract base class for telemetry adapters.
 *
 * Provides a common implementation for filtering telemetry items before processing.
 * Subclasses must implement the `_processItem` method to define how telemetry items are handled.
 *
 * @template TelemetryItem - The type representing a telemetry item.
 * @implements {TelemetryAdapter}
 *
 * @remarks
 * - The adapter can be identified by a unique `identifier`.
 * - An optional filter function can be provided to determine which telemetry items should be processed.
 *
 * @example
 * class MyTelemetryAdapter extends BaseTelemetryAdapter {
 *   protected _processItem(item: TelemetryItem): void {
 *     // Custom processing logic
 *   }
 * }
 */
export abstract class BaseTelemetryAdapter implements TelemetryAdapter {
  #identifier: string;
  #filter?: (item: TelemetryItem) => boolean;

  /**
   * Gets the unique identifier for this telemetry adapter instance.
   *
   * @returns The identifier as a string.
   */
  public get identifier(): string {
    return this.#identifier;
  }

  /**
   * Creates a new instance of the TelemetryAdapter.
   *
   * @param identifier - A unique string identifier for this adapter instance.
   * @param filter - An optional function to filter telemetry items. If provided, only items for which the function returns true will be processed.
   */
  constructor(identifier: string, filter?: (item: TelemetryItem) => boolean) {
    this.#identifier = identifier;
    this.#filter = filter;
  }

  /**
   * Processes a telemetry item by applying an optional filter before handling it.
   *
   * If a filter is defined and the item does not pass the filter, the method returns early.
   * Otherwise, it delegates the processing of the item to the internal `_processItem` method.
   *
   * @param item - The telemetry item to be processed.
   */
  public processItem(item: TelemetryItem): void {
    if (this.#filter && !this.#filter(item)) {
      return;
    }
    this._processItem(item);
  }

  protected abstract _processItem(item: TelemetryItem): void;
}
