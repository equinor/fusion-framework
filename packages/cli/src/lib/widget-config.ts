import {
    loadConfig,
    type ResolvedConfig,
    type FindConfigOptions,
    initiateConfig,
    ConfigExecuterEnv,
    resolveConfig,
} from './utils/config.js';

import { AssertionError, assertObject } from './utils/assert.js';
import deepmerge from 'deepmerge/index.js';

export type WidgetConfig = {
    entry: string;
    dist: string;
};

type FindWidgetConfigOptions = FindConfigOptions & {
    file?: string;
};

export type WidgetConfigFn = (
    env: ConfigExecuterEnv,
    args: { base: WidgetConfig },
) => WidgetConfig | Promise<WidgetConfig>;

export type WidgetConfigExport = WidgetConfig | WidgetConfigFn;

export const widgetConfigFilename = 'widget.config';

export function assertWidgetConfig(value: WidgetConfig): asserts value {
    // TODO
    assertObject(value);
}

export const defineWidgetConfig = (fn: WidgetConfigFn) => fn;

export const mergeWidgetConfigs = (
    base: Partial<WidgetConfig>,
    overrides: Partial<WidgetConfig>,
): WidgetConfig => {
    const manifest = deepmerge(base, overrides) as unknown as WidgetConfig;
    assertWidgetConfig(manifest);
    return manifest;
};

export const loadAppConfig = (filename?: string) =>
    loadConfig<WidgetConfig>(filename ?? widgetConfigFilename);

export const resolveWidgetConfig = async (
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<ResolvedConfig<WidgetConfigFn> | void> => {
    if (options?.file) {
        const config = await loadAppConfig(options.file);
        return {
            config,
            path: options.file,
        };
    }
    return resolveConfig(widgetConfigFilename, { find: options });
};

export const createCleanWidgetConfig = (): WidgetConfig => {
    const widgetConfig: WidgetConfig = {
        entry: 'src/index.ts',
        dist: 'dist',
    };
    assertWidgetConfig(widgetConfig);
    return widgetConfig;
};

export const createWidgetConfig = async (
    env: ConfigExecuterEnv,
    base: WidgetConfig,
    options?: FindWidgetConfigOptions,
): Promise<{ config: WidgetConfig; path?: string }> => {
    const resolved = await resolveWidgetConfig(options);
    if (resolved) {
        const config = await initiateConfig(resolved.config, env, { base });
        assertWidgetConfig(config);
        return { config, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load config from ${options.file}`,
            expected: '<file>',
        });
    }
    return { config: base };
};
