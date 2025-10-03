import {
  TelemetryType,
  TelemetryLevel,
  type TelemetryItem,
  type TelemetryException,
  type TelemetryMetric,
} from '@equinor/fusion-framework-module-telemetry';

import { BaseTelemetryAdapter } from '@equinor/fusion-framework-module-telemetry/adapter';

/**
 * Configuration options for the ConsoleAdapter
 */
export type ConsoleAdapterConfig = {
  /** Optional identifier for the adapter instance */
  identifier?: string;
  /** Optional filter function to control which telemetry items are processed */
  filter?: (item: TelemetryItem) => boolean;
  /** Optional title to display in console output (defaults to 'Fusion') */
  title?: string;
};

/**
 * Telemetry adapter that outputs telemetry data to the browser console
 * with formatted titles and color-coded log levels
 */
export class ConsoleAdapter extends BaseTelemetryAdapter {
  /** Default identifier for console adapter instances */
  static readonly Identifier = 'console-adapter';

  #title: string;

  /**
   * Creates a new ConsoleAdapter instance
   * @param config - Optional configuration for the adapter
   */
  constructor(config?: ConsoleAdapterConfig) {
    super(config?.identifier ?? ConsoleAdapter.Identifier, config?.filter);
    this.#title = config?.title ?? 'Fusion';
  }

  /**
   * Generates background color CSS for the title based on telemetry level
   * @param lvl - The telemetry level
   * @returns CSS background color string
   */
  protected _generateTitleBackground(lvl: TelemetryLevel): string {
    switch (lvl) {
      case TelemetryLevel.Critical:
        return 'rgb(255, 0, 0)';
      case TelemetryLevel.Error:
        // Light red/pink background
        return 'rgb(250, 138, 161)';
      case TelemetryLevel.Warning:
        // Light orange background
        return 'rgb(251, 203, 131)';
      case TelemetryLevel.Information:
        // Light gray background
        return 'rgb(200, 200, 200)';
      case TelemetryLevel.Debug:
        // Medium gray background
        return 'rgb(150, 150, 150)';
      default:
        // No background for unknown levels
        return 'none';
    }
  }

  /**
   * Formats a metric value into a human-readable time string
   * @param value - Time value in milliseconds
   * @returns Formatted time string (ms, s, or m s format)
   */
  protected _formatMetric = (value: number): string => {
    if (value < 1000) {
      // Show milliseconds for values under 1 second
      return `${Math.round(value)}ms`;
    }
    if (value < 60000) {
      // Show seconds with 1 decimal for values under 1 minute
      return `${(value / 1000).toFixed(1)}s`;
    }
    // For longer durations, show minutes and seconds
    const minutes = Math.floor(value / 60000);
    const seconds = Math.floor((value % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  /**
   * Generates formatted console log arguments with colored title styling
   * @param name - The telemetry item name
   * @param lvl - The telemetry level
   * @returns Array of arguments for console.log with CSS styling
   */
  protected _generateTitle(name: string, lvl: TelemetryLevel): string[] {
    return [
      // CSS format string: %c for CSS, %s for string substitution
      '%c %s %c %s %c',
      // Red background for app title
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      // Application title (e.g., "Fusion")
      this.#title,
      // Level-specific background color
      `background: ${this._generateTitleBackground(lvl)}; color: rgb(50, 50, 50); padding: 1px;`,
      // Telemetry item name
      name,
      // Reset styling for remaining content
      'background: none; color: inherit',
    ];
  }

  /**
   * Processes a telemetry item and outputs it to the console
   * @param item - The telemetry item to process
   */
  protected _processItem(item: TelemetryItem): void {
    const { name, type, level, properties, metadata, scope } = item;

    // Common data structure included with all telemetry items
    const baseData = {
      properties,
      metadata,
      scope,
    };

    switch (type) {
      case TelemetryType.Event:
        // Log events with base data
        this._log(level, name, baseData);
        break;
      case TelemetryType.Exception: {
        const exception = (item as TelemetryException).exception;
        // Include exception details
        this._log(level, name, baseData, exception);
        break;
      }
      case TelemetryType.Metric: {
        const metric = (item as TelemetryMetric).value;
        // Format metric with timer emoji
        this._log(level, name, `⏱️${this._formatMetric(metric)}`, baseData);
        break;
      }
    }
  }

  /**
   * Logs a message to the console using the appropriate console method based on level
   * @param lvl - The telemetry level determining which console method to use
   * @param title - The formatted title for the log entry
   * @param msg - Additional message arguments to log
   */
  protected _log(lvl: TelemetryLevel, title: string, ...msg: unknown[]): void {
    switch (lvl) {
      case TelemetryLevel.Critical:
      case TelemetryLevel.Error:
        // Use console.error for errors and critical issues
        console.error(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Warning:
        // Use console.warn for warnings
        console.warn(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Information:
        // Use console.info for info messages
        console.info(...this._generateTitle(title, lvl), ...msg);
        break;
      case TelemetryLevel.Debug:
        // Use console.debug for debug and verbose messages
        console.debug(...this._generateTitle(title, lvl), ...msg);
        break;
      default:
        // Fallback to console.log for unknown levels
        console.log(...this._generateTitle(title, lvl), ...msg);
    }
  }
}

export default ConsoleAdapter;
