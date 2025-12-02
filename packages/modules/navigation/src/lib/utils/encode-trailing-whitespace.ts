/**
 * Encodes trailing whitespace in a string by replacing it with '%20'.
 *
 * @param input - The string to encode
 * @returns The string with trailing whitespace encoded
 *
 * @example
 * ```ts
 * encodeTrailingWhitespace('hello ')
 * // 'hello%20'
 *
 * encodeTrailingWhitespace('hello')
 * // 'hello'
 * ```
 */
export const encodeTrailingWhitespace = (input: string): string => {
  return input.replace(/ $/, '%20');
};
