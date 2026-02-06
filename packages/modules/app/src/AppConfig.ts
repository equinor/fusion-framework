// todo: move to utils
const deepFreeze = <T extends Record<string, unknown>>(obj: T): T => {
  for (const property of Object.keys(obj)) {
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

export type ConfigEnvironment = Record<string, unknown>;

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
   */
  get environment(): TEnvironment {
    return this.#environment;
  }

  /**
   * The configuration endpoints for the application,.
   */
  get endpoints(): Record<string, ConfigEndPoint> {
    return this.#endpoints;
  }

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
