import { readFile } from 'node:fs/promises';

type JSONContent = Record<string, unknown> | string | number | boolean | null | unknown[];

/**
 * Asynchronously imports and parses a JSON file.
 *
 * @template T - The expected type of the parsed JSON content. It can be a record, string, or number.
 * @param {string} filePath - The path to the JSON file to be imported.
 * @returns {Promise<T>} A promise that resolves to the parsed JSON content.
 * @throws {Error} If the file cannot be read or the content is not valid JSON.
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
