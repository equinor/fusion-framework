import pathToRegexp from 'path-to-regexp';

import type { ApiRoute, IncomingRequest, RequestParams } from './types.js';

/**
 * Represents a function that matches a given path and request against specific criteria
 * and returns the result of the match.
 *
 * @typeParam T - The type of request parameters, extending `RequestParams`.
 * @param path - The path to be matched.
 * @param req - The incoming request object.
 * @returns The result of the match, containing information about the matched parameters.
 */
export type Matcher<T extends RequestParams = RequestParams> = (
  path: string,
  req: IncomingRequest,
) => MatchResult<T>;

/**
 * Represents the result of a route matching operation.
 *
 * @template T - A type extending `RequestParams` that defines the structure of the route parameters.
 * @typedef MatchResult
 *
 * @property {boolean} - Indicates whether the route matches without extracting parameters.
 * @property {{ params: T }} - An object containing the extracted route parameters if the route matches.
 */
export type MatchResult<T extends RequestParams> = boolean | { params: T };

/**
 * Creates a route matcher function based on the provided API route definition.
 *
 * This utility supports two types of matching strategies:
 * - **String pattern matching:** If `route.match` is a string, it is interpreted as a
 *   {@link https://www.npmjs.com/package/path-to-regexp | path-to-regexp} pattern. The generated matcher
 *   will extract dynamic parameters from the path and return them as an object if the path matches.
 * - **Custom matcher function:** If `route.match` is a function, it is used directly as the matcher,
 *   allowing for advanced or custom matching logic that can utilize both the path and the request object.
 *
 * @typeParam T - The type of request parameters to extract from the path, extending `RequestParams`.
 * @param route - The API route definition, which specifies either a string pattern or a custom matcher function.
 * @returns A matcher function that takes a path and request, returning either a boolean or an object containing extracted parameters.
 *
 * @example
 * // Using a string pattern to extract parameters:
 * const matcher = createRouteMatcher<{ id: string }>({ match: '/user/:id' });
 * const result = matcher('/user/42', req); // { params: { id: '42' } }
 *
 * @example
 * // Using a custom matcher function:
 * const customMatcher = createRouteMatcher(
 *   { match: (path, req) => path === '/health' && req.method === 'GET' }
 * );
 * const result = customMatcher('/health', req); // true
 */
export function createRouteMatcher<T extends RequestParams>(route: ApiRoute): Matcher<T> {
  // extract the match patterns, if string wrap it to array
  const match = typeof route.match === 'string' ? [route.match] : route.match;
  if (Array.isArray(match)) {
    // create a path-to-regexp matcher for each pattern
    return (path: string): MatchResult<T> => {
      for (const pattern of match) {

        const result = pathToRegexp.match<T>(pattern)(path);
        if (result) {
          return result;
        }
      }
      // no match found
      return false;
    };
  }
  return match as Matcher<T>;
}
