import {
    loadConfig,
    type ResolvedConfig,
    type FindConfigOptions,
    initiateConfig,
    ConfigExecuterEnv,
    resolveConfig,
} from './utils/config.js';

import { AssertionError, assertObject } from './utils/assert.js';
import { ResolvedAppPackage } from './app-package.js';
import deepmerge from 'deepmerge/index.js';

import type { AppConfig } from '@equinor/fusion-framework-module-app';

type FindAppConfigOptions = FindConfigOptions & {
    file?: string;
};

export type AppConfigFn = (
    env: ConfigExecuterEnv,
    args: { base: AppConfig },
) => AppConfig | Promise<AppConfig>;
export type AppConfigExport = AppConfig | AppConfigFn;

export const appConfigFilename = 'app.config';

export function assertAppConfig(value: AppConfig): asserts value {
    // TODO
    assertObject(value);
}

export const defineAppConfig = (fn: AppConfigFn) => fn;

export const mergeAppConfigs = (
    base: Partial<AppConfig>,
    overrides: Partial<AppConfig>,
): AppConfig => {
    const manifest = deepmerge(base, overrides) as unknown as AppConfig;
    assertAppConfig(manifest);
    return manifest;
};

export const loadAppConfig = (filename?: string) =>
    loadConfig<AppConfig>(filename ?? appConfigFilename);

export const resolveAppConfig = async (
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<ResolvedConfig<AppConfigFn> | void> => {
    if (options?.file) {
        const config = await loadAppConfig(options.file);
        return {
            config,
            path: options.file,
        };
    }
    return resolveConfig(appConfigFilename, { find: options });
};

export const createAppConfigFromPackage = (_pkg: ResolvedAppPackage): AppConfig => {
    const appConfig = {};
    assertAppConfig(appConfig);
    return appConfig;
};

export const createAppConfig = async (
    env: ConfigExecuterEnv,
    base: AppConfig,
    options?: FindAppConfigOptions,
): Promise<{ config: AppConfig; path?: string }> => {
    const resolved = await resolveAppConfig(options);
    if (resolved) {
        const config = await initiateConfig(resolved.config, env, { base });
        assertAppConfig(config);
        return { config, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load config from ${options.file}`,
            expected: '<file>',
        });
    }
    return { config: base };
};
