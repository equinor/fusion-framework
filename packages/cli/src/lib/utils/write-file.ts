import {
  existsSync,
  mkdirSync,
  writeFileSync,
  type PathLike,
  type WriteFileOptions,
} from 'node:fs';

import { dirname } from 'node:path';

/**
 * Writes data to a specified file, creating the necessary directories if they do not exist.
 *
 * This utility ensures that the directory structure for the file exists before writing.
 * It is useful for safe file output in scripts and CLIs where the target directory may not exist.
 *
 * @param file - The path to the file where the data should be written.
 * @param data - The content to write to the file. Can be a string or a Node.js `ArrayBufferView`.
 * @param options - Optional settings for writing the file, such as encoding or file mode.
 *
 * @throws Will throw an error if the file cannot be written.
 */
export const writeFile = (
  file: PathLike,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
) => {
  // Get the directory name from the file path.
  const outDir = dirname(String(file));
  // If the directory does not exist, create it recursively.
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  // Write the file to disk with the provided data and options.
  writeFileSync(file, data, options);
};
