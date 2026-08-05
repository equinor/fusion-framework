/**
 * Strips the app basename prefix from a full pathname to produce an
 * app-relative path.
 *
 * App-provided hooks (`extractContextIdFromPath`, `generatePathFromContext`)
 * operate on app-relative paths — they don't know about the portal's
 * `/apps/{appKey}` prefix. This function converts a browser-absolute
 * pathname into the app's local coordinate system before calling those hooks.
 *
 * Always returns a path starting with `/` so app hooks receive consistent input.
 *
 * @param fullPathname - Absolute browser pathname (e.g. `/apps/my-app/route-a`)
 * @param appBasename - The app's base path (e.g. `/apps/my-app`)
 * @returns App-relative path (e.g. `/route-a`), or the input unchanged if
 *          the basename doesn't match (defensive fallback)
 *
 * @example
 * ```ts
 * toAppRelative('/apps/my-app/route-a/ctx', '/apps/my-app'); // '/route-a/ctx'
 * toAppRelative('/apps/my-app', '/apps/my-app');             // '/'
 * toAppRelative('/other/path', '/apps/my-app');              // '/other/path'
 * ```
 */
export function toAppRelative(fullPathname: string, appBasename: string): string {
  // Basename matches the pathname — the app is at its root, return '/' as the relative path
  if (fullPathname === appBasename || fullPathname.startsWith(`${appBasename}/`)) {
    const relative = fullPathname.slice(appBasename.length);
    // Ensure the relative path always starts with '/' for consistent input to app hooks
    return relative.startsWith('/') ? relative : `/${relative}`;
  }
  // Basename not found in pathname — return as-is; the app hook will see the full path
  return fullPathname;
}
