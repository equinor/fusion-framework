/**
 * @packageDocumentation
 *
 * App State API client and types.
 *
 * Provides {@link AppStateApiClient} for reading and wiping a user's stored
 * application state, and for admins to manage per-user state on behalf of
 * an app (`Fusion.AppState.AppAdmin` / `Fusion.AppState.Admin` roles).
 *
 * @example
 * ```ts
 * import { AppStateApiClient } from '@equinor/fusion-framework-module-services/app-state';
 * ```
 */

export { AppStateApiClient, default } from './client';

export { ApiVersion } from './static';

export * from './types';
