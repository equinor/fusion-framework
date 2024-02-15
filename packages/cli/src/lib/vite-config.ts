import nodePath from 'node:path';

import { defineConfig, mergeConfig, type UserConfig, type UserConfigFn } from 'vite';

import { createViteLogger } from './vite-logger.js';

import { AssertionError, assertObject } from './utils/assert.js';

import {
    loadConfig,
    resolveConfig,
    type FindConfigOptions,
    type ResolvedConfig,
    ConfigExecuterEnv,
    initiateConfig,
} from './utils/config.js';

// Plugins

import viteEnv from 'vite-plugin-environment';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileExistsSync } from './utils/file-exists.js';

const configFilename = 'app.vite.config';

export function assertViteConfig(config: UserConfig): asserts config {
    assertObject(config);
}

export const loadViteConfig = (filename?: string) =>
    loadConfig<UserConfig>(filename ?? configFilename);

export const resolveViteConfig = async (
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<ResolvedConfig<UserConfigFn> | void> => {
    if (options?.file) {
        const config = await loadViteConfig(options.file);
        return {
            config,
            path: options.file,
        };
    }
    return resolveConfig(configFilename, { find: options });
};

export const createAppViteConfig = async (
    env: ConfigExecuterEnv,
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<{ config: UserConfig; path?: string } | void> => {
    const resolved = await resolveViteConfig(options);
    if (resolved) {
        const config = await initiateConfig(resolved.config, env);
        return { config, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load config from ${options.file}`,
            expected: '<file>',
        });
    }
};

export const resolveEntryPoint = (
    cwd?: string,
    dir?: string,
    opt?: { files?: string[] },
): string | undefined => {
    cwd ??= process.cwd();
    dir ??= 'src';
    const files = opt?.files ?? ['index.ts', 'index.tsx', 'main.ts', 'main.tsx'];
    return files
        .map((file) => [dir, file].join('/'))
        .find((file) => fileExistsSync(nodePath.resolve(cwd!, file)));
};

export const createViteConfig = async (
    env: ConfigExecuterEnv,
    overrides?: UserConfig,
): Promise<UserConfig> => {
    const { root = process.cwd() } = env;
    const entry = String(resolveEntryPoint(root));
    const defaultConfig = defineConfig({
        plugins: [
            tsconfigPaths(),
            viteEnv({
                NODE_ENV: env.mode,
                ENV_PORT: env.port?.toString() || '3000',
            }),
        ],
        root,
        server: {
            middlewareMode: true,
        },
        appType: 'custom',
        build: {
            lib: {
                entry: {
                    [env.outputFileName || 'bundle']: entry,
                },
                formats: ['es'],
            },
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                },
            },
        },
        customLogger: createViteLogger(),
    });
    return overrides ? mergeConfig(defaultConfig, overrides) : defaultConfig;
};
