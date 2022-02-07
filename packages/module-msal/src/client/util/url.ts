/**
 * Creates and normalizes redirect uri.
 * Strips double and trailing slashes
 *
 * @internal
 *
 * @param uri - relative path or full url
 * @param home - base url for relative urls
 */
export const normalizeUri = (uri: string, home: string = window.location.origin): string => {
    uri = uri.match(/^http[s]?/) ? uri : home + uri;
    const { origin, pathname } = new URL(uri);
    return origin + pathname.replace(/((?<=[/])[/]+)|\/$/, '');
};

/**
 * Compares normalized version of urls
 *
 * @internal
 */
export const compareOrigin = (a: string, b: string): boolean => {
    const url = { a: normalizeUri(a), b: normalizeUri(b) };
    return url.a === url.b;
};
