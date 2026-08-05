/**
 * Re-exported shared types scoped for the App State service.
 *
 * @packageDocumentation
 */

import type {
  FilterAllowedApiVersions as FilterAllowApiVersionsBase,
  ExtractApiVersion as ExtractApiVersionBase,
} from '../types';

import type { ApiVersion } from './static';

export { ClientMethodType, ClientMethod, ApiClientArguments } from '../types';

/**
 * Union of allowed version keys and values for the App State API.
 *
 * @template TAllowed - Subset of `ApiVersion` keys to include.
 */
export type FilterAllowedApiVersions<TAllowed extends string = keyof typeof ApiVersion> =
  FilterAllowApiVersionsBase<typeof ApiVersion, TAllowed>;

/**
 * Extracts the concrete version string from a key-or-value version identifier
 * for the App State API.
 *
 * @template TVersion - The version string to resolve.
 * @template TAllowed - Constraint on allowed versions.
 */
export type ExtractApiVersion<
  TVersion extends string,
  TAllowed extends string = FilterAllowedApiVersions,
> = ExtractApiVersionBase<typeof ApiVersion, TVersion, TAllowed>;
