/**
 * Prepends the app basename to an app-relative path to produce a full
 * browser-absolute pathname.
 *
 * Inverse of {@link toAppRelative}. After an app hook generates a new
 * app-relative path (with context encoded), this function converts it
 * back into a full pathname suitable for browser navigation.
 *
 * Handles edge cases where either side may or may not have a leading/trailing slash.
 *
 * @param appRelativePath - App-relative path (e.g. `/route-a/ctx-id`)
 * @param appBasename - The app's base path (e.g. `/apps/my-app`)
 * @returns Full browser pathname (e.g. `/apps/my-app/route-a/ctx-id`)
 *
 * @example
 * ```ts
 * toFullPath('/route-a/ctx-id', '/apps/my-app');  // '/apps/my-app/route-a/ctx-id'
 * toFullPath('route-a/ctx-id', '/apps/my-app/');  // '/apps/my-app/route-a/ctx-id'
 * ```
 */
export function toFullPath(appRelativePath: string, appBasename: string): string {
  // Strip trailing slash from base so we can unconditionally prepend a leading slash from rel
  const base = appBasename.endsWith('/') ? appBasename.slice(0, -1) : appBasename;
  // Ensure rel always starts with '/' before concatenation to avoid double- or missing-slash
  const rel = appRelativePath.startsWith('/') ? appRelativePath : `/${appRelativePath}`;
  return `${base}${rel}`;
}
