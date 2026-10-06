/**
 * @module @equinor/fusion-framework-module-navigation
 *
 * Navigation module for Fusion Framework providing routing and navigation capabilities.
 *
 * Manages observable navigation state with automatic basename localization,
 * so consumers work with clean paths while the underlying history receives
 * full paths including the basename prefix.
 *
 * @remarks
 * Supports browser, hash, and memory history types. Integrates with
 * `@remix-run/router` for router creation and is compatible with
 * industry-standard routers (Remix / React Router).
 *
 * @example
 * ```ts
 * import { enableNavigation, createHistory } from '@equinor/fusion-framework-module-navigation';
 *
 * enableNavigation(configurator, '/apps/my-app');
 * ```
 *
 * @packageDocumentation
 */

export type { INavigationConfigurator } from './NavigationConfigurator.interface.js';
export { NavigationConfigurator } from './NavigationConfigurator.js';

export { NavigationModule, module, moduleKey } from './module.js';
export { enableNavigation } from './enable-navigation.js';

export type { INavigationProvider } from './NavigationProvider.interface.js';
export { NavigationProvider } from './NavigationProvider.js';

export { createHistory } from './lib/create-history.js';

export { NavigateEvent, type NavigateEventDetail } from './NavigateEvent.js';
export { NavigatedEvent, type NavigatedEventDetail } from './NavigatedEvent.js';

export type {
  Path,
  To,
  Location,
  History,
  NavigationBlocker,
  NavigationListener,
} from './lib/types.js';

/**
 * @deprecated Use {@link History} instead.
 */
export type { History as INavigator } from './lib/index.js';
