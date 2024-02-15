import deepmerge from 'deepmerge';

import {
    loadConfig,
    initiateConfig,
    resolveConfig,
    type FindConfigOptions,
    type ResolvedConfig,
    ConfigExecuterEnv,
} from './utils/config.js';

import { AssertionError, assert, assertObject } from './utils/assert.js';
import { RecursivePartial } from './utils/types.js';

import { AnyARecord } from 'node:dns';
import {
    ResolvedWidgetPackage,
    resolveWidgetEntryPoint,
    resolveWidgetKey,
} from './widget-package.js';
import { Spinner } from '../bin/utils/spinner.js';

export type WidgetManifest = {
    id: string;
    name: string;
    version: string;
    description?: string;
    maintainers?: string[];
    entryPoint: string;
    assetPath: string;
};

export type WidgetConfig = Omit<WidgetManifest, 'id' | 'description' | 'maintainers' | 'version'>;

export type WidgetEnv<TProps = unknown> = {
    basename?: string;
    manifest?: WidgetManifest;
    props?: TProps;
};

export type WidgetProps = Record<PropertyKey, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fusion = AnyARecord;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WidgetRenderArgs<
    TFusion extends Fusion = Fusion,
    TEnv = WidgetEnv,
    TProps extends WidgetProps = WidgetProps,
> = {
    fusion: TFusion;
    env: TEnv;
    props?: TProps;
};

export type WidgetScriptModule<TProps extends WidgetProps = WidgetProps> = {
    default: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderWidget: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    renderIcon: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
    render: (el: HTMLElement, args: WidgetRenderArgs, props?: TProps) => VoidFunction;
};

export type WidgetManifestFn = (
    env: ConfigExecuterEnv,
    args: {
        base: WidgetManifest;
    },
) => WidgetManifest | Promise<WidgetManifest>;

type FindManifestOptions = FindConfigOptions & {
    file?: string;
};

/** base filename for configuration files */
export const manifestConfigFilename = 'widget.manifest.config';

/**
 * Define a manifest for an application
 *
 * @see {@link mergeManifests | extend manifest}
 *
 * @example
 * ```ts
 * export default defineAppManifest(async() => {
 *    // fetch some data, example owner from secrets
 *    const owner = gh.secrets.owners:
 *    return {
 *        ...all_required_attributes
 *        owners,
 *    }
 * })
 * ```
 * @param fnOrObj - defines the manifest as an object or callback
 */
export const defineWidgetManifest = (fn: WidgetManifestFn) => fn;

export function assertWidgetManifest(value: WidgetManifest): asserts value {
    assert(value, 'expected manifest');
    // TODO make assertions
}

/**
 * @example
 * ```ts
 * export default defineAppManifest(base) => mergeManifests(base, {prop: value});
 * ```
 * @param base base manifest to merge with
 * @param overrides target manifest to apply to base
 * @returns deep merged manifest
 */
export const mergeWidgetManifests = (
    base: RecursivePartial<WidgetManifest>,
    overrides: RecursivePartial<WidgetManifest>,
): WidgetManifest => {
    const manifest = deepmerge(base, overrides) as unknown as WidgetManifest;
    assertWidgetManifest(manifest as unknown as WidgetManifest);
    return manifest;
};

/** loads manifestFn from file */
export const loadWidgetManifest = (filename?: string) =>
    loadConfig<WidgetManifest>(filename ?? manifestConfigFilename);

/**
 * tries to resolve manifest
 * @see {@link resolveConfig | resolving config}
 */
export const resolveManifest = async (
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<ResolvedConfig<WidgetManifestFn> | void> => {
    if (options?.file) {
        const config = await loadWidgetManifest(options.file);
        return {
            config,
            path: options.file,
        };
    }
    return resolveConfig(manifestConfigFilename, { find: options });
};

export const createWidgetManifestFromPackage = (pkg: ResolvedWidgetPackage): WidgetManifest => {
    const { packageJson } = pkg;
    assertObject(packageJson, 'expected packageJson');
    assert(packageJson.name, 'expected [name] in packageJson');
    assert(packageJson.version, 'expected [version] in packageJson');
    const name = resolveWidgetKey(pkg.packageJson);
    const entryPoint = resolveWidgetEntryPoint(pkg.packageJson);
    assert(entryPoint, 'expected [version] in packageJson');

    const manifest = {
        id: '',
        name,
        entryPoint,
        version: packageJson.version,
        assetPath: '',
        // TODO manifest should not be loaded from package
        description: packageJson.description,
    } satisfies WidgetManifest;
    assertWidgetManifest(manifest);
    return manifest;
};

export const createWidgetManifest = async (
    env: ConfigExecuterEnv,
    base: WidgetManifest,
    options?: FindManifestOptions,
): Promise<{ manifest: WidgetManifest; path?: string }> => {
    const spinner = new Spinner();

    const resolved = await resolveManifest(options);
    spinner.info(JSON.stringify(resolved));
    spinner.info(JSON.stringify(base));
    if (resolved) {
        const manifest = await initiateConfig(resolved.config, env, { base });
        assertWidgetManifest(manifest);
        return { manifest, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load manifest from ${options.file}`,
            expected: '<manifest>',
        });
    }
    return { manifest: base };
};
