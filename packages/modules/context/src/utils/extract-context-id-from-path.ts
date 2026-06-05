// GUID pattern
const matchGUID =
  /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

/**
 * Method will try to extract a context id from a path.
 * The default matcher is a GUID pattern.
 * Will iterate over the path and return the first match.
 *
 * @example
 * ```ts
 * const path = '/apps/context/7fd97952-7fe6-409b-a6dc-292dbf0e50d7?dsadasdas#example';
 * const contextId = extractContextIdFromPath(path); // '7fd97952-7fe6-409b-a6dc-292dbf0e50d7'
 * 
 * // Custom matcher for numeric IDs
 * extractContextIdFromPath('/projects/42/details', /^\d+$/);  // '42'
 *
 * // No match
 * extractContextIdFromPath('/apps/my-app/settings'); // undefined
 * ```
 *
 * @param path string - the path to extract the context id from
 * @param matcher RegExp - the pattern to match against
 * @returns string | undefined - the context id or undefined
 */
export const extractContextIdFromPath = (
  path: string,
  matcher: RegExp = matchGUID,
): string | undefined =>
  // 
  path
    // remove query-string and hash fragments before segment matching
    .split(/[?#]/)[0]
    // remove leading slashes
    .replace(/^\/+/, '')
    // split path by slashes
    .split('/')
    // find the first path fragment that matches the matcher
    .find((x) => x.match(matcher));
