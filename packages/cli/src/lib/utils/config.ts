import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { findUpMultiple, type Options } from 'find-up';

import { assert } from 'node:console';
import { AssertionError } from 'node:assert';
import { pathToFileURL } from 'node:url';
import { transpile } from './ts-transpile.js';
import { fileExists } from './file-exists.js';

export const supportedExt = ['.ts', '.mjs', '.js', '.json'] as const;

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
> = (...args: TArgs) => TType | Promise<TType>; // eslint-disable-next-line @typescript-eslint/no-explicit-any

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
  for (const ext of values) {
    assert(
      supportedExt.includes(ext as SupportedExt),
      new AssertionError({
        message: message ?? 'unsupported file type',
        actual: value,
        expected: supportedExt.join('|'),
      }),
    );
  }
}

const configExtname = (file: string): SupportedExt => {
  const ext = extname(file);
  assertConfigFileType(ext);
  return ext as unknown as SupportedExt;
};

export const loadConfig = async <TType>(file: string): Promise<ConfigExecuter<TType>> => {
  assert(await fileExists(file, { assert: true }), `failed to access file ${file}`);
  switch (configExtname(file)) {
    case '.ts': {
      return loadConfig(await transpile(file));
    }
    case '.mjs':
    case '.js': {
      const result = (await import(String(pathToFileURL(file)))).default;
      return typeof result === 'function' ? result : () => result;
    }
    case '.json': {
      return async () => JSON.parse(await readFile(file, 'utf-8'));
    }
    default:
      throw Error('unsupported file type');
  }
};

export function initiateConfig<TConfig extends ConfigExecuter>(
  config: TConfig,
  ...args: Parameters<TConfig>
): Promise<ConfigExecuterType<TConfig> | void> {
  return Promise.resolve(config(...(args as ConfigExecuterArgs)));
}

export default loadConfig;
