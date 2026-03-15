/**
 * `@equinor/fusion-log` — structured, level-filtered logging utilities for
 * Fusion Framework applications.
 *
 * @remarks
 * This package provides a small, RxJS-backed logging abstraction with a
 * console implementation and helpers for resolving log levels from
 * environment variables.
 *
 * @packageDocumentation
 */

export type { ILogger } from './Logger.interface.js';

export { ConsoleLogger } from './ConsoleLogger.js';

export { defaultLogLevel, LogLevel } from './static.js';

export { resolveLogLevel } from './resolve-log-level.js';

export { version } from './version.js';
