import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, ContextNavigationAdapterFactory } from '../types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';
import { stripContextQueryParam } from '../utils/url/strip-context-query-param';

/**
 * Normalize legacy app generator outputs to a plain string.
 *
 * Legacy apps may return their path values as either a bare string or
 * wrapped in an array (e.g. `['path']` or `[]`). This function unifies
 * both shapes into `string | undefined` so downstream code doesn't need
 * to branch on format.
 *
 * @param value - Raw return value from an app generator hook
 * @returns The resolved string, or `undefined` if the value is empty/invalid
 *
 * @example
 * ```ts
 * normalizeStringResult('/foo/bar');    // '/foo/bar'
 * normalizeStringResult(['/foo/bar']); // '/foo/bar'
 * normalizeStringResult([]);           // undefined
 * normalizeStringResult('');           // undefined
 * ```
 */
export function normalizeStringResult(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === 'string' && first.length > 0) {
      return first;
    }
    return undefined;
  }
  return undefined;
}

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
  if (fullPathname === appBasename || fullPathname.startsWith(`${appBasename}/`)) {
    const relative = fullPathname.slice(appBasename.length);
    return relative.startsWith('/') ? relative : `/${relative}`;
  }
  return fullPathname;
}

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
  const base = appBasename.endsWith('/') ? appBasename.slice(0, -1) : appBasename;
  const rel = appRelativePath.startsWith('/') ? appRelativePath : `/${appRelativePath}`;
  return `${base}${rel}`;
}

/**
 * Custom adapter factory — delegates URL encoding/decoding to app-provided hooks.
 *
 * **Intent:** Some apps define their own URL shape for context (e.g.
 * `/route-a/{contextId}` instead of the standard `/{contextId}/route-a`).
 * These apps register `extractContextIdFromPath` and `generatePathFromContext`
 * on their context provider. This adapter bridges those app hooks into the
 * navigation handler's adapter contract so the reconciler can drive navigation
 * without knowing the app's specific URL layout.
 *
 * **Selection:** The factory returns a bound adapter only when the app has
 * both generator hooks registered (checked via {@link hasCustomContextGenerators}).
 * Otherwise it returns `null`, letting lower-priority adapters (query, path) match.
 *
 * **Coordinate system:** All app hooks receive/return app-relative paths.
 * The adapter handles stripping and prepending the `/apps/{appKey}` prefix
 * transparently via {@link toAppRelative} and {@link toFullPath}.
 *
 * **Query string preservation:** The adapter always carries forward
 * `currentURL.search` to the output URL, ensuring query parameters
 * (e.g. `?routingStrategy=custom`) survive navigation.
 */
export function createCustomAdapter(): ContextNavigationAdapterFactory {
  return ({ appContext, appKey }): ContextNavigationAdapter | null => {
    if (!hasCustomContextGenerators(appContext)) {
      return null;
    }

    const appBasename = `/apps/${appKey}`;
    const rawExtract = appContext.extractContextIdFromPath;
    const rawGenerate = appContext.generatePathFromContext;

    if (!rawExtract || !rawGenerate) {
      return null;
    }

    // Capture narrowed references — TypeScript can't narrow across the closure boundary
    const extract = rawExtract;
    const generate = rawGenerate;

    return {
      id: 'custom',

      /** Always true — selection already happened in the factory guard above. */
      canHandle(): boolean {
        return true;
      },

      /**
       * Encode a context into the URL using the app's path generator.
       *
       * - **Null context:** navigates to the app root (clears context from URL).
       * - **Existing context in URL:** replaces it with the new context id,
       *   preferring the app generator's output, falling back to string replacement.
       * - **No existing context:** delegates entirely to the app generator.
       *
       * Returns `null` when the generator cannot produce a path (signals the
       * reconciler to skip navigation).
       */
      encode({
        context,
        currentURL,
      }: {
        context: ContextItem | null;
        currentURL: URL;
      }): URL | null {
        if (context === null) {
          const url = new URL(appBasename, currentURL.origin);
          url.search = currentURL.search;
          // Remove query-adapter param — custom apps encode context in the path
          stripContextQueryParam(url);
          return url;
        }

        const appRelativePath = toAppRelative(currentURL.pathname, appBasename);
        const existingContextId = normalizeStringResult(extract(appRelativePath)) ?? undefined;

        let generatedPath: string | undefined;

        if (existingContextId) {
          // Context already in URL — regenerate path or fall back to id replacement
          generatedPath =
            normalizeStringResult(generate(context, appRelativePath)) ??
            appRelativePath.replace(existingContextId, context.id);
        } else {
          // No context in URL — ask app generator where to place it
          generatedPath = normalizeStringResult(generate(context, appRelativePath));
        }

        if (!generatedPath) {
          return null;
        }

        const fullPath = toFullPath(generatedPath, appBasename);
        const url = new URL(fullPath, currentURL.origin);
        url.search = currentURL.search;
        // Remove query-adapter param — custom apps encode context in the path
        stripContextQueryParam(url);
        return url;
      },

      /**
       * Decode a context id from the URL using the app's path extractor.
       *
       * Converts the browser URL to an app-relative path, then delegates
       * to the app's extract hook. Returns `null` when no context is present.
       */
      decode(url: URL): string | null {
        const appRelativePath = toAppRelative(url.pathname, appBasename);
        return normalizeStringResult(extract(appRelativePath)) ?? null;
      },
    };
  };
}
