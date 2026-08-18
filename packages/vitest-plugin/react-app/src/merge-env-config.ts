import { AppConfig } from '@equinor/fusion-framework-module-app';
import type { ConfigEnvironment } from '@equinor/fusion-framework-module-app';
import type { AppEnv } from '@equinor/fusion-framework-app';

type EndpointOverride = Partial<NonNullable<AppEnv['config']>['endpoints'][string]>;

/**
 * Overrides accepted by {@link mergeEnvConfig}.
 */
export type MergeEnvConfigOverrides<TConfig extends ConfigEnvironment = ConfigEnvironment> = {
  environment?: Partial<TConfig>;
  endpoints?: Record<string, EndpointOverride>;
};

/**
 * Merges `environment`/`endpoints` overrides into an `AppEnv`'s `config`.
 *
 * @remarks
 * `AppConfig` stores both behind private fields exposed only through getters, so
 * `{ ...env.config, endpoints: {...} }` silently drops everything it doesn't explicitly
 * restate — a plain object spread copies no own enumerable properties off an `AppConfig`
 * instance. Reach for this instead of hand-rolling that merge in a test fixture.
 *
 * @template TEnv - The `AppEnv` shape being merged into.
 * @param env - The `AppEnv` to merge overrides into; left untouched, `config` may be omitted.
 * @param overrides - Partial `environment`/`endpoints` values, merged over any existing config.
 * @returns A new `AppEnv` with a new `AppConfig` reflecting the merge.
 * @example
 * ```ts
 * const test = testApp.extend('appEnv', ({ appEnv }) =>
 *   mergeEnvConfig(appEnv, { endpoints: { 'cpr-api': { url: backendBaseUrl } } }),
 * );
 * ```
 */
export function mergeEnvConfig<TEnv extends AppEnv = AppEnv>(
  env: TEnv,
  overrides: MergeEnvConfigOverrides<
    TEnv['config'] extends AppConfig<infer TConfig> ? TConfig : ConfigEnvironment
  >,
): TEnv {
  // each overridden endpoint keeps any field the caller didn't explicitly override
  const endpoints = Object.entries(overrides.endpoints ?? {}).reduce(
    // defaults, then any existing endpoint, then the override (override wins)
    (acc, [key, override]) =>
      Object.assign(acc, { [key]: Object.assign({ url: '', scopes: [] }, acc[key], override) }),
    { ...env.config?.endpoints },
  );
  // caller-supplied environment values win over the existing ones
  return {
    ...env,
    config: new AppConfig({
      environment: { ...env.config?.environment, ...overrides.environment },
      endpoints,
    }),
  };
}

export default mergeEnvConfig;
