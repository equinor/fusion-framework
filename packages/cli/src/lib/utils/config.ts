import { readFile, access, constants as fsConstants } from 'node:fs/promises';
import { extname } from 'node:path';

import { findUpMultiple, Options } from 'find-up';

import * as tsImport from 'ts-import';
import { assert } from 'node:console';
import { AssertionError } from 'node:assert';

export const supportedExt = ['.ts', '.js', '.json'] as const;

export type SupportedExt = (typeof supportedExt)[number];

export type FindConfigOptions = Omit<Options, 'file'> & { extensions?: Array<SupportedExt> };

export type ResolveConfigOptions = { find?: FindConfigOptions };

export type ConfigExecuterEnv = {
    /** cli command */
    command: 'serve' | 'build';
    /** cli mode */
    mode: string;
    /** root of the package */
    root?: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConfigExecuterArgs = [ConfigExecuterEnv, ...any[]];

export type ConfigExecuter<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TType = any,
    TArgs extends ConfigExecuterArgs = ConfigExecuterArgs,
> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: TArgs) => TType | Promise<TType>;

export type ConfigExecuterType<T> = T extends ConfigExecuter<infer TType> ? TType : never;

export type ResolvedConfig<TType extends ConfigExecuter> = {
    path: string;
    config: TType;
};

/**
 * @param filename name if config file without extension
 */
export const findConfigs = async (
    filename: string,
    options?: FindConfigOptions,
): Promise<string[]> => {
    const { extensions, ...findOptions } = options ?? {};
    extensions && assertConfigFileType(extensions);
    return findUpMultiple(
        (extensions ?? supportedExt).map((ext) => [filename, ext].join('')),
        {
            ...findOptions,
            type: 'file',
        },
    );
};

export const resolveConfig = async <TType>(
    filename: string,
    options?: ResolveConfigOptions,
): Promise<ResolvedConfig<ConfigExecuter<TType>> | void> => {
    const [file] = await findConfigs(filename, options?.find);
    if (file) {
        return {
            path: file,
            config: await loadConfig<TType>(file),
        };
    }
};

function assertConfigFileType(value: string | string[], message?: string): asserts value {
    const values = typeof value === 'string' ? [value] : value;
    values.forEach((ext) =>
        assert(
            supportedExt.includes(ext as SupportedExt),
            new AssertionError({
                message: message ?? 'unsupported file type',
                actual: value,
                expected: supportedExt.join('|'),
            }),
        ),
    );
}

const configExtname = (file: string): SupportedExt => {
    const ext = extname(file);
    assertConfigFileType(ext);
    return ext as unknown as SupportedExt;
};

export const loadConfig = async <TType>(file: string): Promise<ConfigExecuter<TType>> => {
    assert(access(file, fsConstants.F_OK), `failed to access file ${file}`);
    switch (configExtname(file)) {
        case '.ts': {
            const result = (await tsImport.load(file)).default;
            return typeof result === 'function' ? result : () => result;
        }
        case '.js': {
            const result = (await import(file)).default;
            return typeof result === 'function' ? result : () => result;
        }
        case '.json': {
            return async () => JSON.parse(await readFile(file, 'utf-8'));
        }
    }
};

export function initiateConfig<TConfig extends ConfigExecuter>(
    config: TConfig,
    ...args: Parameters<TConfig>
): Promise<ConfigExecuterType<TConfig>> {
    return Promise.resolve(config(...(args as ConfigExecuterArgs)));
}

export default loadConfig;
