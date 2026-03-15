/**
 * @packageDocumentation
 *
 * Context API client and types.
 *
 * Provides {@link ContextApiClient} for fetching, querying, and listing
 * related contexts, with versioned endpoints (`v1`, `v2`).
 *
 * @example
 * ```ts
 * import { ContextApiClient } from '@equinor/fusion-framework-module-services/context';
 * ```
 */

export { ContextApiClient, default } from './client';

export { ApiVersion } from './static';

export { ApiContextEntity } from './api-models';

export * from './api-models';
export * from './types';
