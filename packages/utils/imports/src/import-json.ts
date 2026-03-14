import { readFile } from 'node:fs/promises';

/** Union of types that `JSON.parse` can produce. */
type JSONContent = Record<string, unknown> | string | number | boolean | null | unknown[];

/**
 * Reads a JSON file from disk and returns the parsed content.
 *
 * Use this when you need to load a plain JSON configuration file without
 * esbuild transpilation. For mixed TypeScript / JSON config resolution,
 * prefer {@link importConfig}.
 *
 * @template T - Expected shape of the parsed JSON. Constrained to valid JSON value types.
 * @param filePath  - Absolute or relative path to the `.json` file.
 * @param encoding  - Character encoding used when reading the file (default `'utf-8'`).
 * @returns The parsed JSON content cast to `T`.
 * @throws {Error} When the file cannot be read or contains invalid JSON, with
 *   the original error attached as `cause`.
 *
 * @example
 * ```typescript
 * interface AppManifest { name: string; version: string }
 * const manifest = await importJSON<AppManifest>('./app.manifest.json');
 * ```
 */
export const importJSON = async <T extends JSONContent>(
  filePath: string,
  encoding: BufferEncoding = 'utf-8',
): Promise<T> => {
  try {
    const content = await readFile(filePath, encoding);
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON from file: '${filePath}'`, { cause: error });
  }
};

export default importJSON;
