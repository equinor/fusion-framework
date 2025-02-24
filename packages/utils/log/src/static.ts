import { resolveLogLevel } from './resolve-log-level';

/**
 * Defines the different log levels that can be used to control the verbosity of logging.
 *
 * - `None`: No logging will be performed.
 * - `Error`: Due to a more serious problem, the software has not been able to perform some function.
 * - `Warning`: An indication that something unexpected happened, or indicative of some problem in the near future.
 * - `Info`: Confirmation that things are working as expected.
 * - `Debug`: Detailed information, typically of interest only when diagnosing problems.
 */
export enum LogLevel {
  None = 0, // No logging will be performed.
  Error = 1, // Due to a more serious problem, the software has not been able to perform some function.
  Warning = 2, // An indication that something unexpected happened, or indicative of some problem in the near future.
  Info = 3, // Confirmation that things are working as expected.
  Debug = 4, // Detailed information, typically of interest only when diagnosing problems.
}

/**
 * Resolves the default log level based on the `FUSION_LOG_LEVEL` environment variable.
 *
 * If the `FUSION_LOG_LEVEL` environment variable is set, it will attempt to parse the log level from it.
 * If the parsing fails, it will return `LogLevel.Debug` in development environments, or `LogLevel.Error` in production environments.
 *
 * If the `FUSION_LOG_LEVEL` environment variable is not set, it will default to `LogLevel.Error`.
 *
 * @returns {LogLevel} The resolved default log level.
 */
const resolveDefaultLogLevel = (): LogLevel => {
  // Check if FUSION_LOG_LEVEL is set in environment variables
  const envLogLevel = process.env.FUSION_LOG_LEVEL;

  if (envLogLevel) {
    try {
      // Attempt to parse the log level from the environment variable
      return resolveLogLevel(envLogLevel);
    } catch (error) {
      // If parsing fails, return Debug level in development, otherwise Error level
      return process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Error;
    }
  }

  // Default to Error level if FUSION_LOG_LEVEL is not set
  return LogLevel.Error;
};

export const defaultLogLevel = resolveDefaultLogLevel();
