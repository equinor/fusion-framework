/**
 * @packageDocumentation
 *
 * Notification API client and types.
 *
 * Provides {@link NotificationApiClient} for creating, fetching, deleting
 * notifications, marking them as seen, and managing user notification
 * settings, with versioned endpoints (`v1`, `v2`).
 *
 * @example
 * ```ts
 * import { NotificationApiClient } from '@equinor/fusion-framework-module-services/notification';
 * ```
 */

export { NotificationApiClient, default } from './client';

export { ApiVersion } from './static';

export * from './api-models';
export * from './types';
