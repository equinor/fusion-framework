// todo: move to utils
const deepFreeze = <T extends Record<string, unknown>>(obj: T): T => {
    Object.keys(obj).forEach((property) => {
        if (
            typeof obj[property] === 'object' &&
            obj[property] !== null &&
            !Object.isFrozen(obj[property])
        ) {
            deepFreeze(obj[property] as Record<string, unknown>);
        }
    });
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
 *
 * @param {Object} config - The configuration object.
 * @param {TEnvironment} [config.environment] - The environment configuration.
 * @param {Record<string, ConfigEndPoint>} [config.endpoints] - The endpoints configuration.
 *
 * @property {TEnvironment} [environment] - The environment configuration.
 * @property {Record<string, string | undefined>} endpoints - The endpoints configuration (deprecated).
 *
 * @method getEndpoint
 * @param {string} key - The key of the endpoint to retrieve.
 */
export class AppConfig<TEnvironment extends ConfigEnvironment = ConfigEnvironment> {
    #endpoints: Record<string, ConfigEndPoint>;

    public readonly environment: TEnvironment;

    public get endpoints(): Record<string, string | undefined> {
        console.warn('endpoints is deprecated, use getEndpoint instead');
        return new Proxy(this.#endpoints, {
            get(target, prop): string | undefined {
                return target[prop as string]?.url;
            },
        }) as unknown as Record<string, string>;
    }

    constructor(config: {
        environment?: TEnvironment | null;
        endpoints?: Record<string, ConfigEndPoint>;
    }) {
        this.environment = deepFreeze(config.environment ?? {}) as TEnvironment;
        this.#endpoints = config.endpoints ?? {};
    }

    getEndpoint(key: string): ConfigEndPoint | undefined {
        return this.#endpoints[key];
    }
}
