import type { History } from './lib/types';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

/**
 * Configuration object for the navigation module.
 *
 * Provides options for customizing the history implementation, basename prefix,
 * telemetry tracking, and event dispatching used by the {@link NavigationProvider}.
 */
export interface INavigationConfigurator {
  /**
   * Base pathname prefix for the application (e.g. `"/apps/my-app"`).
   *
   * When set, the navigation provider automatically prepends this prefix to
   * outgoing paths and strips it from incoming paths, so consumer code
   * operates on clean, basename-free paths.
   */
  basename?: string;

  /**
   * Custom {@link History} instance for navigation.
   *
   * If not provided, defaults to browser history in browser environments
   * or memory history in Node.js environments. Create instances with
   * {@link createHistory}.
   */
  history?: History;

  /**
   * Telemetry provider for tracking navigation events, location changes,
   * and errors for monitoring and debugging.
   */
  telemetry?: ITelemetryProvider;

  /**
   * Event provider for dispatching {@link NavigateEvent} and {@link NavigatedEvent}.
   * Allows other modules to listen for and react to navigation changes.
   */
  eventProvider?: IEventModuleProvider;
}
