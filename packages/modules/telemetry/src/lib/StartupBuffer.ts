import { TelemetryLevel } from '../static.js';
import type { TelemetryItem } from '../types.js';

/**
 * Startup records retained before a provider exists. One further slot is reserved for the
 * overflow summary, so a startup burst never retains more than 256 records.
 */
const STARTUP_RECORD_CAPACITY = 255;

/**
 * Bounded buffer for records captured before a telemetry provider exists.
 *
 * At capacity, a failure record replaces the oldest lower-severity record, so failure evidence
 * survives a startup burst; everything else is dropped and counted for an overflow summary.
 *
 * @example
 * ```ts
 * const buffer = new StartupBuffer();
 * buffer.push(record);
 * const { items, dropped } = buffer.drain();
 * ```
 */
export class StartupBuffer {
  #items: TelemetryItem[] = [];
  #dropped = 0;

  /**
   * Creates an empty buffer.
   * @param capacity - Records retained before records are dropped.
   */
  constructor(readonly capacity = STARTUP_RECORD_CAPACITY) {}

  /**
   * Retains a record, preferring failure records once the buffer is full.
   * @param item - Sanitized startup record.
   */
  push(item: TelemetryItem): void {
    // Retain records until capacity.
    if (this.#items.length < this.capacity) {
      this.#items.push(item);
      return;
    }
    // Prefer failure evidence over successful startup measurements when capacity is exhausted.
    const replace = this.#items.findIndex((record) => record.level < TelemetryLevel.Error);
    // Replacing only lower-severity entries prevents later successes from evicting failures.
    if (item.level === TelemetryLevel.Error && replace >= 0) {
      this.#items.splice(replace, 1, item);
    }
    this.#dropped++;
  }

  /**
   * Takes every retained record and the dropped count, leaving the buffer empty.
   * @returns Retained records, oldest first, and how many were dropped.
   */
  drain(): { items: TelemetryItem[]; dropped: number } {
    const drained = { items: this.#items, dropped: this.#dropped };
    this.#items = [];
    this.#dropped = 0;
    return drained;
  }
}

export default StartupBuffer;
