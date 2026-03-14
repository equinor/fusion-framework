import { LogLevel } from './static.js';

/**
 * Parse a {@link LogLevel} from its case-insensitive enum key name.
 *
 * Performs a case-insensitive lookup against `LogLevel` member names
 * (e.g. `"debug"`, `"Warning"`, `"ERROR"`).
 *
 * @param key - The string name of the log level (case-insensitive).
 * @returns The matching {@link LogLevel} numeric value.
 * @throws {Error} If `key` is not a string or does not match any `LogLevel` member.
 */
const resolveLogLevelFromString = (key: string): LogLevel => {
  if (typeof key !== 'string') {
    throw new Error('Expected LogLevel key to be a string.');
  }

  const keyLowerCase = key.toLowerCase();
  const logLevelKey = Object.keys(LogLevel).find(
    (x) => x.toLowerCase() === keyLowerCase,
  );

  if (!logLevelKey) {
    throw new Error(`Failed to parse LogLevel from string: ${key}.`);
  }

  return LogLevel[logLevelKey as keyof typeof LogLevel];
};

/**
 * Resolve a {@link LogLevel} from a string name or numeric value.
 *
 * Use this function to convert user-supplied or environment-variable values
 * into a type-safe `LogLevel`. Accepts:
 *
 * - A **number** that matches a `LogLevel` member value (`0`–`4`).
 * - A **numeric string** (e.g. `"3"`) that, when parsed, matches a member value.
 * - A **named string** that matches a `LogLevel` member name case-insensitively
 *   (e.g. `"debug"`, `"Warning"`).
 *
 * @param value - The string or number to resolve.
 * @returns The resolved {@link LogLevel}.
 * @throws {Error} If `value` cannot be mapped to a valid `LogLevel`.
 *
 * @example
 * ```typescript
 * import { resolveLogLevel, LogLevel } from '@equinor/fusion-log';
 *
 * resolveLogLevel('debug');   // LogLevel.Debug  (4)
 * resolveLogLevel(2);         // LogLevel.Warning
 * resolveLogLevel('3');       // LogLevel.Info
 * ```
 */
export const resolveLogLevel = (value: string | number): LogLevel => {
  const logLevel = Number(value);

  if (Object.values(LogLevel).includes(logLevel)) {
    return logLevel;
  } else if (isNaN(logLevel)) {
    return resolveLogLevelFromString(value as string);
  }

  throw Error(`Invalid log level: ${value}`);
};
