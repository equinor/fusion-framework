/**
 * Shared CLI display and server utilities.
 *
 * Provides formatting helpers, spinner/logger abstractions,
 * dev-server factory functions, and default HTTP headers used
 * across all Fusion CLI commands.
 *
 * @packageDocumentation
 */
export { formatPath } from './format-path.js';
export { formatByteSize } from './format-byte-size.js';
export { default as chalk } from 'chalk';
export { Spinner } from './Spinner.js';
export { ConsoleLogger } from './ConsoleLogger.js';
export {
  createDevServerConfig,
  type CreateDevServerOptions,
} from './create-dev-server-config.js';
export { createDevServer } from './create-dev-server.js';
export { defaultHeaders } from './default-headers.js';
export { formatAuthError } from './format-auth-error.js';
export { formatTokenAcquisitionError } from './format-token-acquisition-error.js';
