const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Checks if a string is an absolute URL.
 *
 * @param href - The URL string to check
 * @returns True if the string is an absolute URL, false otherwise
 *
 * @example
 * ```ts
 * isAbsoluteUrl('https://example.com/users')
 * // true
 *
 * isAbsoluteUrl('//example.com/users')
 * // true
 *
 * isAbsoluteUrl('/users')
 * // false
 * ```
 */
export const isAbsoluteUrl = (href: string): boolean => {
  return ABSOLUTE_URL_REGEX.test(href);
};
