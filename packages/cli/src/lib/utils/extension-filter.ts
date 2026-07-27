/**
 * Removes the leading dot from a file extension string.
 * `.` are a RegExp special character, so it needs to be escaped.
 */
const trimLeadingDot = (ext: string) => ext.replace(/^\./, '');

/**
 * Creates a regular expression pattern to filter files based on their extensions.
 *
 * @param exts - An array of file extensions to include in the pattern.
 * @returns A RegExp object that matches files with the specified extensions.
 *
 * @example
 * ```typescript
 * const pattern = createExtensionFilterPattern(['.js', '.ts']);
 * console.log(pattern); // Output: /\.(js|ts)(\?.*)?$/
 * ```
 */
export const createExtensionFilterPattern = (exts: string[]) => {
  // Normalize extensions (strip leading dots) before building the alternation group
  const normalizedExts = exts.map(trimLeadingDot);
  return new RegExp(`\\.(${normalizedExts.join('|')})(\\?.*)?$`);
};

export default createExtensionFilterPattern;
