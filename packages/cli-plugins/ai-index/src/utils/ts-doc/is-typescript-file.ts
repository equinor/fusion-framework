/**
 * Checks whether a file path has a TypeScript (`.ts`) or TSX (`.tsx`) extension.
 *
 * @param filePath - Absolute or relative file path.
 * @returns `true` if the file extension is `.ts` or `.tsx`.
 */
export const isTypescriptFile = (filePath: string): boolean => {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
};
