/**
 * Enum representing the severity levels of telemetry items.
 *
 * @remarks
 * This enum is used to categorize telemetry items based on their severity level.
 * It helps in filtering and prioritizing telemetry data for monitoring and analysis.
 *
 * @enum
 * @property {TelemetryLevel.Verbose} Verbose - Detailed information, typically for debugging.
 * @property {TelemetryLevel.Information} Information - General information about the system's operation.
 * @property {TelemetryLevel.Warning} Warning - Indicates a potential issue that is not critical.
 * @property {TelemetryLevel.Error} Error - Represents an error that has occurred, but the system can continue running.
 * @property {TelemetryLevel.Critical} Critical - A severe error that may cause the system to stop functioning.
 */
export enum TelemetryLevel {
  Verbose = 0,
  Information = 1,
  Warning = 2,
  Error = 3,
  Critical = 4,
}

/**
 * Enum representing the different types of telemetry data that can be tracked.
 *
 * @remarks
 * This enum is used to categorize telemetry entries for logging, monitoring, and analytics purposes.
 *
 * @enum
 * @property {TelemetryType.Event} Event - Represents a general event telemetry.
 * @property {TelemetryType.Exception} Exception - Represents an exception or error telemetry.
 * @property {TelemetryType.Metric} Metric - Represents a metric or measurement telemetry.
 * @property {TelemetryType.Custom} Custom - Represents a custom-defined telemetry type.
 */
export enum TelemetryType {
  Event = 'event',
  Exception = 'exception',
  Metric = 'metric',
  Custom = 'custom',
}

/**
 * Defines the available scopes for telemetry data collection.
 *
 * - `Framework`: Telemetry related to the underlying framework.
 * - `Application`: Telemetry specific to the application layer.
 */
export enum TelemetryScope {
  Framework = 'framework',
  Application = 'application',
}
