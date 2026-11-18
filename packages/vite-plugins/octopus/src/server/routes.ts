/**
 * App requests that Octopus answers for registered apps. Paths are relative to the apps API
 * base URL, e.g. `/persons/me/apps/my-app`.
 */
export type AppRequest =
  /** The app manifest, answered by the app's dev server. */
  | { type: 'manifest'; appKey: string }
  /** The app config for a build, answered by the app's dev server. */
  | { type: 'config'; appKey: string; version: string }
  /** A script, served from the app's dev server. */
  | { type: 'bundle'; appKey: string; path: string };

/**
 * Parses the path and query of a request. `req.url` is a path, so it is placed after a fixed
 * origin instead of being resolved against one, which would read `//host/x` as another host and
 * throw for `//[`.
 *
 * @param url - The request's `url`, e.g. `/apps/persons/me/apps/my-app?x=1`.
 * @returns A URL on `http://localhost` with the request's path and query; never throws.
 */
export const parseRequestUrl = (url = '/'): URL =>
  new URL(`http://localhost${url.startsWith('/') ? url : `/${url}`}`);

// Version-tagged manifests (`/apps/<key>@<tag>`), user settings and build lists always come from CI.
const MANIFEST = /^\/persons\/me\/apps\/([^/@]+)$/;
const CONFIG = /^\/apps\/([^/@]+)\/builds\/([^/]+)\/config$/;
// Script paths carry the version as `<key>@<version>` or `<key>/<version>`, depending on the CLI version.
const BUNDLE = /^\/bundles\/apps\/([^/@]+)(?:@|\/)[^/]+\/(.+)$/;
// A semver version or tag. Octopus builds the dev server address from it, so nothing else passes.
const BUILD_VERSION = /^[\w.+-]+$/;

/**
 * Finds out whether an apps API request is one a local app answers.
 *
 * @param pathname - Request path, without the query string.
 * @returns The app request, or `undefined` for requests that always go to CI.
 */
export const parseAppRequest = (pathname: string): AppRequest | undefined => {
  const manifest = pathname.match(MANIFEST);
  if (manifest) {
    return { type: 'manifest', appKey: manifest[1] };
  }

  const config = pathname.match(CONFIG);
  if (config) {
    const version = config[2];
    return BUILD_VERSION.test(version) ? { type: 'config', appKey: config[1], version } : undefined;
  }

  const bundle = pathname.match(BUNDLE);
  if (bundle) {
    // Local manifests use an absolute file path as entry point, which leaves a double slash.
    return { type: 'bundle', appKey: bundle[1], path: bundle[2].replace(/^\/+/, '') };
  }

  return undefined;
};
