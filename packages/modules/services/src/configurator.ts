import type { ApiClientFactory } from './types';

/**
 * Configuration interface for the services module.
 *
 * Consumers can set `createClient` to override how HTTP clients are resolved
 * for each backend service. When left `undefined`, the module automatically
 * resolves clients through the HTTP module and service-discovery module.
 */
export interface IApiConfigurator {
  /** Optional factory for creating named HTTP clients. */
  createClient?: ApiClientFactory;
}

/**
 * Default configurator for the services module.
 *
 * Implements {@link IApiConfigurator} with an initially empty configuration.
 * The module initialization step populates `createClient` if it was not
 * provided during configuration.
 */
export class ApiConfigurator implements IApiConfigurator {}
