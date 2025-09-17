/**
 * @fileoverview Versioning module for MSAL module compatibility checking.
 *
 * This module provides comprehensive version resolution and validation functionality
 * for the MSAL module, ensuring compatibility between different MSAL library versions.
 *
 * @example
 * ```typescript
 * import { resolveVersion, VersionError } from '@equinor/fusion-framework-module-msal/versioning';
 *
 * try {
 *   const result = resolveVersion('2.1.0');
 *   console.log('Version is compatible:', result.satisfiesLatest);
 * } catch (error) {
 *   if (error instanceof VersionError) {
 *     console.error('Version error:', error.message);
 *   }
 * }
 * ```
 */

// Core versioning functionality
export { resolveVersion } from './resolve-version';

// Error handling
export { VersionError } from './VersionError';

// Types
export type { ResolvedVersion } from './types';
