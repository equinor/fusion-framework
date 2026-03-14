/**
 * @packageDocumentation
 *
 * People API client and types.
 *
 * Provides {@link PeopleApiClient} for person lookups, search, photo retrieval,
 * suggestions, and identifier resolution, with versioned endpoints (`v2`, `v4`).
 *
 * @example
 * ```ts
 * import { PeopleApiClient } from '@equinor/fusion-framework-module-services/people';
 * ```
 */

export { PeopleApiClient, default } from './client';

export { ApiVersion } from './static';

export * from './api-models';
