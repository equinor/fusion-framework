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
export const createExtensionFilterPattern = (exts: string[]) =>
    new RegExp(`\\.(${exts.map(trimLeadingDot).join('|')})(\\?.*)?$`);

export default createExtensionFilterPattern;
