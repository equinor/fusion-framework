/**
 * Checks whether a file path has a Markdown (`.md`) or MDX (`.mdx`) extension.
 *
 * @param filePath - Absolute or relative file path.
 * @returns `true` when the extension is `.md` or `.mdx`.
 */
export const isMarkdownFile = (filePath: string): boolean => {
  return filePath.endsWith('.md') || filePath.endsWith('.mdx');
};
