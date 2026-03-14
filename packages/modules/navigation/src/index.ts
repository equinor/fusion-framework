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

export type { INavigationConfigurator } from './NavigationConfigurator.interface';
export { NavigationConfigurator } from './NavigationConfigurator';

export { NavigationModule, module, moduleKey } from './module';
export { enableNavigation } from './enable-navigation';

export type { INavigationProvider } from './NavigationProvider.interface';
export { NavigationProvider } from './NavigationProvider';

export { createHistory } from './lib/create-history';

export {
  NavigateEvent,
  NavigatedEvent,
  type NavigateEventDetail,
  type NavigatedEventDetail,
} from './events';

export type {
  Path,
  To,
  Location,
  History,
  NavigationBlocker,
  NavigationListener,
} from './lib/types';

/**
 * @deprecated Use {@link History} instead.
 */
export type { History as INavigator } from './lib';
