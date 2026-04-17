/**
 * Low-level URL manipulation helpers that operate on full browser URLs
 * rather than application-relative paths.
 *
 * These are used when the app needs to produce absolute hrefs for hard
 * navigation, cross-app linking, or stripping context from the address bar.
 *
 * @module url
 */

import { STATIC_ROUTES } from '../constants';

/**
 * Returns `true` when the first path segment is a dynamic context id
 * rather than a well-known static route name.
 *
 * @param pathname - Application-relative pathname
 * @returns Whether the path starts with a context-id segment
 */
export const hasPathContext = (pathname: string): boolean => {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return Boolean(firstSegment && !STATIC_ROUTES.has(firstSegment));
};

/**
 * Replaces the application-relative suffix of a full URL pathname.
 *
 * Given a portal URL like `/apps/my-app/route-a`, this replaces
 * the app-relative portion (`/route-a`) with `nextAppPath`.
 *
 * @param fullPath - The complete browser pathname
 * @param appPath - The current application-relative path (suffix to replace)
 * @param nextAppPath - The replacement application-relative path
 * @returns The rewritten full pathname
 */
export const replaceAppPathSuffix = (
  fullPath: string,
  appPath: string,
  nextAppPath: string,
): string => {
  if (appPath === '/' || appPath === '') {
    return `${fullPath.replace(/\/+$/, '')}${nextAppPath}`;
  }

  if (!fullPath.endsWith(appPath)) {
    return fullPath;
  }

  return `${fullPath.slice(0, fullPath.length - appPath.length)}${nextAppPath}`;
};

/**
 * Builds an absolute URL that hard-navigates to `/route-b` by rewriting
 * the current browser location, bypassing the in-app router.
 *
 * Used to verify that the app correctly re-initialises context after a
 * full page navigation.
 *
 * @param pathname - Current application-relative pathname
 * @returns Absolute URL pointing at `/route-b`
 */
export const getOutsideFrameworkRouteBHref = (pathname: string): string => {
  const url = new URL(globalThis.location.href);
  url.pathname = replaceAppPathSuffix(url.pathname, pathname, '/route-b');
  url.search = '';
  return url.toString();
};

/**
 * Resolves an absolute URL for a sibling app inside the dev-portal.
 *
 * Strips the current `/apps/{appKey}` segment from the browser pathname
 * and replaces it with the target app key.
 *
 * @param appKey - The target app's route key (e.g. `'meetings'`)
 * @returns Absolute URL pointing at the sibling app
 */
export const getPortalAppHref = (appKey: string): string => {
  const url = new URL(globalThis.location.href);
  const appBasename = url.pathname.match(/\/?apps\/[a-z0-9-]+/)?.[0] ?? '';
  url.pathname = appBasename
    ? url.pathname.slice(0, url.pathname.indexOf(appBasename)) + `/apps/${appKey}`
    : `/apps/${appKey}`;
  url.search = '';
  return url.toString();
};

/**
 * Strips context-id segments from a pathname, leaving only known
 * static route segments.
 *
 * @param pathname - Application-relative pathname
 * @returns A cleaned pathname with only static route segments
 */
export const stripContextFromPath = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const cleaned = segments.filter((s) => STATIC_ROUTES.has(s));
  return cleaned.length > 0 ? `/${cleaned.join('/')}` : '/';
};
