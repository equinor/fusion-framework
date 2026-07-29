/**
 * Recursively freezes an object and all of its nested properties.
 *
 * @template T - Object type being frozen.
 * @param obj - The object to deep-freeze.
 * @returns The same object, deeply frozen.
 */
const deepFreeze = <T extends Record<string, unknown>>(obj: T): T => {
  // recursively freeze any nested, unfrozen object properties
  for (const property of Object.keys(obj)) {
    // only descend into unfrozen object properties
    if (
      typeof obj[property] === 'object' &&
      obj[property] !== null &&
      !Object.isFrozen(obj[property])
    ) {
      deepFreeze(obj[property] as Record<string, unknown>);
    }
  }
  return Object.freeze(obj);
};

/**
 * Arbitrary key-value record representing environment-specific variables
 * injected into an application's runtime configuration.
 */
export type ConfigEnvironment = Record<string, unknown>;

/**
 * A named endpoint from the application configuration, containing a URL
 * and the OAuth scopes required to call it.
 */
export type ConfigEndPoint = {
  url: string;
  scopes: string[];
};

/**
 * Class representing the application configuration.
 *
 * @template TEnvironment - The type of the environment configuration, extending `ConfigEnvironment`.
 *
 * @remarks
 * The `AppConfig` class provides a way to manage application configuration, including environment settings and endpoints.
 *
 * @example
 * ```typescript
 * const config = new AppConfig({
 *   environment: { ... },
 *   endpoints: {
 *     api: { url: 'https://api.example.com' }
 *   }
 * });
 *
 * console.log(config.getEndpoint('api')); // { url: 'https://api.example.com' }
 * ```
 */
export class AppConfig<TEnvironment extends ConfigEnvironment = ConfigEnvironment> {
  #endpoints: Record<string, ConfigEndPoint>;
  #environment: TEnvironment;

  /**
   * The environment configuration for the application.
   * @returns The frozen environment configuration.
   */
  get environment(): TEnvironment {
    return this.#environment;
  }

  /**
   * The configuration endpoints for the application.
   * @returns The frozen map of configuration endpoints.
   */
  get endpoints(): Record<string, ConfigEndPoint> {
    return this.#endpoints;
  }

  /**
   * Creates a new {@link AppConfig}, deep-freezing the provided environment and endpoints.
   * @param config - The environment and endpoints to initialize the configuration with.
   */
  constructor(config: {
    environment?: TEnvironment | null;
    endpoints?: Record<string, ConfigEndPoint>;
  }) {
    this.#environment = deepFreeze(config.environment ?? {}) as TEnvironment;
    this.#endpoints = deepFreeze(config.endpoints ?? {});
  }

  /**
   * Retrieves the configuration endpoint associated with the given key.
   *
   * @param key - The key corresponding to the desired configuration endpoint.
   * @returns The configuration endpoint if found, otherwise `undefined`.
   */
  getEndpoint(key: string): ConfigEndPoint | undefined {
    return this.#endpoints[key];
  }
}
