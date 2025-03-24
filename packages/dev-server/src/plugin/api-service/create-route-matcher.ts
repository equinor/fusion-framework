import { match } from 'path-to-regexp';

import type { ApiRoute, IncomingRequest, RequestParams } from './types';

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
 * Creates a route matcher function for a given API route.
 *
 * @param route - The API route object containing the match criteria.
 *                The `match` property can either be a string (interpreted as a path-to-regexp pattern)
 *                or a function that takes a path string and returns a boolean or undefined.
 * @returns A function that takes a path string as input and returns a boolean
 *          indicating whether the path matches the route's criteria.
 */
export function createRouteMatcher<T extends RequestParams>(route: ApiRoute): Matcher<T> {
  if (typeof route.match === 'string') {
    return (path: string): MatchResult<T> => {
      return match<T>(route.match as string)(path);
    };
  }
  return route.match as Matcher<T>;
}
