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

  /**
   * The environment configuration for the application.
   * This property is read-only and is of type `TEnvironment`.
   */
  public readonly environment: TEnvironment;

  constructor(config: {
    environment?: TEnvironment | null;
    endpoints?: Record<string, ConfigEndPoint>;
  }) {
    this.environment = deepFreeze(structuredClone(config.environment ?? {})) as TEnvironment;
    this.#endpoints = deepFreeze(structuredClone(config.endpoints ?? {}));
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

  /**
   * Retrieve all configuration endpoints associated with the app.
   *
   * @returns The configuration endpoints found.
   */
  getEndpoints(): Record<string, ConfigEndPoint> {
    return this.#endpoints;
  }
}
