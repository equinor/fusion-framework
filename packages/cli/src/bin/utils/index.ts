/**
 * Shared CLI display and server utilities.
 *
 * Provides formatting helpers, spinner/logger abstractions,
 * dev-server factory functions, and default HTTP headers used
 * across all Fusion CLI commands.
 *
 * @packageDocumentation
 */
export { formatPath, formatByteSize, chalk } from './format.js';
export { Spinner } from './spinner.js';
export { ConsoleLogger } from './ConsoleLogger.js';
export {
  createDevServerConfig,
  createDevServer,
  type CreateDevServerOptions,
} from './create-dev-server.js';
export { defaultHeaders } from './defaultHeaders.js';
export { formatAuthError, formatTokenAcquisitionError } from './format-auth-error.js';
