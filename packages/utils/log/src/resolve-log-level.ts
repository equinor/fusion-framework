import { LogLevel } from './static.js';

/**
 * Resolves a log level from a string representation.
 *
 * @param key - The string representation of the log level.
 * @returns The corresponding `LogLevel` value, or `undefined` if the input string does not match any known log level.
 * @throws Error if the input string does not match any known log level.
 */
const resolveLogLevelFromString = (key: string): LogLevel => {
  if (typeof key !== 'string') {
    throw new Error('Expected LogLevel key to be a string.');
  }
  // Convert the input key to lowercase for case-insensitive comparison
  const keyLowerCase = key.toLowerCase();
  const logLevelKey = Object.keys(LogLevel).find(
    // Match log level key in a case-insensitive manner
    (x) => x.toLowerCase() === keyLowerCase,
  );
  if (!logLevelKey) {
    // Throw error if no matching log level key is found
    throw new Error(`Failed to parse LogLevel from string: ${key}.`);
  }
  // Return the corresponding LogLevel value
  return LogLevel[logLevelKey as keyof typeof LogLevel];
};

/**
 * Resolves the log level from the provided value, which can be a string or a number.
 *
 * If the value is a number, it checks if it is a valid log level. If it is, the function returns the log level.
 * If the value is not a valid log level, the function throws an error.
 *
 * If the value is a string, the function resolves the log level from the string using the `resolveLogLevelFromString` function.
 *
 * @param value - The value to resolve the log level from, can be a string or a number.
 * @returns The resolved log level.
 * @throws {Error} If the provided value is not a valid log level.
 */
export const resolveLogLevel = (value: string | number): LogLevel => {
  // Convert the level to a number
  const logLevel = Number(value);
  // Check if the number is a valid log level
  if (Object.values(LogLevel).includes(logLevel)) {
    return logLevel;
  } else if (isNaN(logLevel)) {
    // Resolve log level from string if level is NaN
    return resolveLogLevelFromString(value as string);
  }
  // Throw an error if the level is invalid
  throw Error(`Invalid log level: ${value}`);
};
