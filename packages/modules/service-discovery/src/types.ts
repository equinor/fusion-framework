/**
 * Resolved service endpoint returned by the service discovery API.
 *
 * Each `Service` represents a single backend endpoint with its base URI,
 * authentication scopes, and metadata. Use the `key` property to look up
 * a specific service via {@link IServiceDiscoveryProvider.resolveService}.
 */
export type Service = {
  /** Unique lookup key used to identify the service (e.g. `"context"`, `"people"`). */
  key: string;

  /** Base URI of the service endpoint (e.g. `"https://api.example.com/context"`). */
  uri: string;

  /** OAuth scopes required when requesting tokens for this service. */
  scopes?: string[];

  /** Optional unique identifier of the service registration. */
  id?: string;

  /** Human-readable display name of the service. */
  name?: string;

  /** Freeform tags attached to the service registration. */
  tags?: string[];

  /**
   * Indicates whether this service configuration has been overridden via
   * `sessionStorage`.
   *
   * When `true`, the `uri` and `scopes` values were replaced at runtime
   * by the session-override system and do not reflect the values returned
   * by the remote service discovery API.
   *
   * @see {@link ServiceDiscoveryConfigurator.configureServiceDiscoveryClient}
   * for how session overrides are applied.
   */
  overridden?: boolean;

  /**
   * OAuth scopes for this service.
   *
   * @deprecated Use {@link Service.scopes | scopes} instead. This accessor
   * is kept for backward compatibility and delegates to `scopes`.
   */
  defaultScopes: string[];
};
