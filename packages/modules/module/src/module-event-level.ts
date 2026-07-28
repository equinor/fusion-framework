/**
 * Defines the severity levels for module events.
 * Used to categorize events by their importance and impact.
 * Matches the TelemetryLevel enum sequence for consistency.
 */
export enum ModuleEventLevel {
  /** Debug events that provide detailed internal information for troubleshooting */
  Debug = 0,
  /** Information events that provide general operational details */
  Information = 1,
  /** Warning events that indicate potential issues but don't prevent operation */
  Warning = 2,
  /** Error events that indicate failures or critical issues */
  Error = 3,
  /** Critical events that indicate severe failures */
  Critical = 4,
}

export default ModuleEventLevel;
