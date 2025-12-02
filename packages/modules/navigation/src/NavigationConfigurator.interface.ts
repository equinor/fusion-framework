import type { History } from './lib/types';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

/**
 * Configuration object for the navigation module.
 * Provides options for customizing history, basename, telemetry, and event settings.
 */
export interface INavigationConfigurator {
  /** Optional base pathname for the application (e.g., "/app") */
  basename?: string;
  /** Optional custom history instance (browser, hash, or memory). If not provided, defaults to browser history. */
  history?: History;
  /** Optional telemetry provider for tracking navigation events */
  telemetry?: ITelemetryProvider;
  /** Optional event provider for dispatching navigation events */
  eventProvider?: IEventModuleProvider;
}
