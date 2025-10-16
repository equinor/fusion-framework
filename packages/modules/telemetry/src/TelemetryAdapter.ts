import type { TelemetryItem } from './types.js';

/**
 * Represents an adapter for processing telemetry items.
 *
 * Implementations of this interface are responsible for handling telemetry data.
 * Adapters are identified by their key in the Record<string, ITelemetryAdapter> structure.
 *
 * @method processItem - Processes a given telemetry item.
 * @param item - The telemetry item to be processed.
 * @method initialize - Optional asynchronous initialization method for adapters that require setup.
 * @returns A promise that resolves when initialization is complete.
 */
export interface ITelemetryAdapter {
  processItem(item: TelemetryItem): void;
  initialize(): Promise<void>;
}

/**
 * Abstract base class for telemetry adapters.
 *
 * Provides a common implementation for filtering telemetry items before processing.
 * Subclasses must implement the `_processItem` method to define how telemetry items are handled.
 *
 * @template TelemetryItem - The type representing a telemetry item.
 * @implements {ITelemetryAdapter}
 *
 * @remarks
 * - An optional filter function can be provided to determine which telemetry items should be processed.
 *
 * @example
 * class MyTelemetryAdapter extends BaseTelemetryAdapter {
 *   protected _processItem(item: TelemetryItem): void {
 *     // Custom processing logic
 *   }
 * }
 */
export abstract class BaseTelemetryAdapter implements ITelemetryAdapter {
  #filter?: (item: TelemetryItem) => boolean;
  #initialized = false;

  /**
   * Creates a new instance of the TelemetryAdapter.
   *
   * @param filter - An optional function to filter telemetry items. If provided, only items for which the function returns true will be processed.
   */
  constructor(filter?: (item: TelemetryItem) => boolean) {
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
    // If the adapter is not initialized, do not process the item
    if (!this.#initialized) {
      return;
    }

    // If a filter is defined and the item does not pass the filter, do not process the item
    if (this.#filter && !this.#filter(item)) {
      return;
    }

    // Delegate the processing of the item to the internal `_processItem` method
    this._processItem(item);
  }

  /**
   * Initializes the telemetry adapter asynchronously.
   *
   * This method can only be called once. Subsequent calls will return immediately
   * without performing any initialization. It calls the protected `_initialize` method which
   * subclasses can override to provide custom initialization logic.
   *
   * TODO: Consider changing return type from Promise<void> to Promise<TelemetryItem[]>
   * to allow adapters to return telemetry items (errors/warnings) that occurred during
   * initialization, eliminating the chicken-and-egg problem with reporting init errors.
   *
   * @returns A promise that resolves when initialization is complete.
   * @sealed
   */
  public async initialize(): Promise<void> {
    // If the adapter is already initialized, do not initialize it again
    if (this.#initialized) {
      return;
    }

    // Initialize the adapter
    await this._initialize();

    // Mark the adapter as initialized
    this.#initialized = true;
  }

  /**
   * Protected initialization method that subclasses can override.
   *
   * This method is called only once during the adapter's lifetime.
   * Subclasses should override this method to perform any necessary async setup.
   * The base implementation is a no-op for adapters that don't need initialization.
   *
   * @returns A promise that resolves when initialization is complete.
   * @protected
   */
  protected async _initialize(): Promise<void> {
    // Default implementation - no-op for adapters that don't need initialization
  }

  protected abstract _processItem(item: TelemetryItem): void;
}
