import { z } from 'zod';
import {
    loadConfig,
    type ResolvedConfig,
    type FindConfigOptions,
    initiateConfig,
    ConfigExecuterEnv,
    resolveConfig,
} from './utils/config.js';

import { AssertionError } from './utils/assert.js';

import { ApiAppConfig, ApiAppConfigSchema } from '../schemas.js';

type FindAppConfigOptions = FindConfigOptions & {
    file?: string;
};

export type AppConfigFn = (
    env: ConfigExecuterEnv,
    args: { base: ApiAppConfig },
) => z.input<typeof ApiAppConfigSchema> | Promise<z.input<typeof ApiAppConfigSchema> | void> | void;
export type AppConfigExport = ApiAppConfig | AppConfigFn;

export const appConfigFilename = 'app.config';
export const defineAppConfig = (fn: AppConfigFn) => fn;

export const loadAppConfig = (filename?: string) =>
    loadConfig<ApiAppConfig>(filename ?? appConfigFilename);

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

export const createAppConfig = async (
    env: ConfigExecuterEnv,
    base: ApiAppConfig,
    options?: FindAppConfigOptions,
): Promise<{ config: ApiAppConfig; path?: string }> => {
    const resolved = await resolveAppConfig(options);
    if (resolved) {
        const configValue = (await initiateConfig(resolved.config, env, { base })) ?? {};
        const config = ApiAppConfigSchema.parse(configValue);
        return { config, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load config from ${options.file}`,
            expected: '<file>',
        });
    }
    return { config: base };
};
