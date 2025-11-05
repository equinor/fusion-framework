import { type ILoggerCallback, LogLevel } from '@azure/msal-browser';
import {
  type ITelemetryProvider,
  TelemetryLevel,
} from '@equinor/fusion-framework-module-telemetry';

/**
 * Maps MSAL log levels to corresponding telemetry levels.
 *
 * This mapping ensures consistent log level translation between MSAL's logging
 * system and the framework's telemetry system.
 */
const levelMap: Partial<Record<LogLevel, TelemetryLevel>> = {
  [LogLevel.Verbose]: TelemetryLevel.Debug,
  [LogLevel.Info]: TelemetryLevel.Information,
  [LogLevel.Warning]: TelemetryLevel.Warning,
  [LogLevel.Error]: TelemetryLevel.Error,
};

/**
 * Parses MSAL log message into structured components.
 *
 * MSAL log messages follow the format:
 * [timestamp] : [correlationId] : [package] : [level] - [component] - [message]
 *
 * @param message - Raw MSAL log message
 * @returns Parsed message components
 */
const parseMsalMessage = (message: string) => {
  // Match the structured format: [timestamp] : [correlationId] : [package] : [level] - [component] - [message]
  const match = message.match(
    /^\[([^\]]+)\]\s*:\s*\[([^\]]*)\]\s*:\s*([^:]+)\s*:\s*(\w+)\s*-\s*([^-]+)\s*-\s*(.*)$/,
  );

  if (match) {
    const [, _timestamp, _correlationId, packageInfo, _logLevel, component, logMessage] = match;
    return {
      package: packageInfo.trim() ?? undefined,
      component: component.trim() ?? undefined,
      message: logMessage.trim() ?? undefined,
    };
  }

  // Fallback for non-structured messages
  return { message: message.trim() };
};

/**
 * Creates a telemetry callback function for MSAL logging integration.
 *
 * This function bridges MSAL's internal logging system with the framework's
 * telemetry infrastructure. It maps MSAL log levels to telemetry levels and
 * forwards log events to the provided telemetry provider with structured metadata.
 *
 * The callback function returned by this method will be called by MSAL whenever
 * a log event occurs, allowing for centralized logging and monitoring of
 * authentication-related events.
 *
 * @param provider - Telemetry provider instance to receive log events
 * @param metadata - Additional metadata to include with each telemetry event (e.g., module version, environment)
 * @param scope - Telemetry scope identifiers for categorization and filtering
 * @returns Logger callback function for MSAL that forwards events to telemetry provider
 *
 * @example
 * ```typescript
 * const callback = createClientLogCallback(
 *   telemetryProvider,
 *   { module: 'msal', version: '4.0.0' },
 *   ['framework', 'authentication']
 * );
 *
 * // Use with MSAL configuration
 * const config = {
 *   system: {
 *     loggerOptions: {
 *       loggerCallback: callback,
 *       piiLoggingEnabled: false
 *     }
 *   }
 * };
 * ```
 */
export const createClientLogCallback = (
  provider: ITelemetryProvider,
  metadata: Record<string, unknown>,
  scope: string[],
): ILoggerCallback | undefined => {
  return (level: LogLevel, message: string, _containsPii: boolean) => {
    const parsedMessage = parseMsalMessage(message);

    provider.trackEvent({
      name: 'MsalClient',
      level: levelMap[level] ?? TelemetryLevel.Information,
      scope,
      metadata,
      properties: {
        ...parsedMessage,
      },
    });
  };
};
