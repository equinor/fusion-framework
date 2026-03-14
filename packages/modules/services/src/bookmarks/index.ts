/**
 * @packageDocumentation
 *
 * Bookmarks API client and types.
 *
 * Provides {@link BookmarksApiClient} for CRUD operations on bookmarks
 * and favourite management, with versioned endpoints (`v1`, `v2`).
 *
 * @example
 * ```ts
 * import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
 * ```
 */

export { BookmarksApiClient, default } from './client';
export { ApiVersion } from './api-version';
export * from './schemas';
export type * from './types';
