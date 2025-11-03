import type { History } from '@remix-run/router';

/**
 * Configuration interface for the navigation module.
 * Provides options for customizing history and basename settings.
 */
export interface INavigationConfigurator {
  /** Optional base pathname for the application (e.g., "/app") */
  basename?: string;
  /** Optional custom history instance (browser, hash, or memory). If not provided, defaults to browser history. */
  history?: History;
}

/**
 * Configurator class for navigation module settings.
 * Allows configuring basename and custom history instances.
 */
export class NavigationConfigurator implements INavigationConfigurator {
  /** Optional custom history instance */
  public history?: History;
  /** Optional base pathname for the application */
  public basename?: string;
}
