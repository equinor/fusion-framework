/**
 * App requests that Octopus answers for registered apps. Paths are relative to the apps API
 * base URL, e.g. `/persons/me/apps/my-app`.
 */
export type AppRequest =
  /** The app manifest or config, answered by the app's dev server. */
  | { type: 'api'; appKey: string }
  /** A script, served from the app's dev server. */
  | { type: 'bundle'; appKey: string; path: string };

// Version-tagged manifests (`/apps/<key>@<tag>`), user settings and build lists always come from CI.
const MANIFEST = /^\/persons\/me\/apps\/([^/@]+)$/;
const CONFIG = /^\/apps\/([^/@]+)\/builds\/[^/]+\/config$/;
// Script paths carry the version as `<key>@<version>` or `<key>/<version>`, depending on the CLI version.
const BUNDLE = /^\/bundles\/apps\/([^/@]+)(?:@|\/)[^/]+\/(.+)$/;

/**
 * Finds out whether an apps API request is one a local app answers.
 *
 * @param pathname - Request path, without the query string.
 * @returns The app request, or `undefined` for requests that always go to CI.
 */
export const parseAppRequest = (pathname: string): AppRequest | undefined => {
  const api = pathname.match(MANIFEST) ?? pathname.match(CONFIG);
  if (api) {
    return { type: 'api', appKey: api[1] };
  }

  const bundle = pathname.match(BUNDLE);
  if (bundle) {
    // Local manifests use an absolute file path as entry point, which leaves a double slash.
    return { type: 'bundle', appKey: bundle[1], path: bundle[2].replace(/^\/+/, '') };
  }

  return undefined;
};
