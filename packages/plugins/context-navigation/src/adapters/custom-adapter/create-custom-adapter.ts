import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, ContextNavigationAdapterFactory } from '../types.js';
import { hasCustomContextGenerators } from '../../utils/has-custom-context-generators.js';
import { stripContextQueryParam } from '../../utils/url/strip-context-query-param.js';
import { normalizeStringResult } from './normalize-string-result.js';
import { toAppRelative } from './to-app-relative.js';
import { toFullPath } from './to-full-path.js';

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
 * Explicit query routing bypasses these hooks so the declared strategy remains authoritative.
 * Otherwise it returns `null` when hooks are absent, letting lower-priority adapters match.
 *
 * **Coordinate system:** All app hooks receive/return app-relative paths.
 * The adapter handles stripping and prepending the `/apps/{appKey}` prefix
 * transparently via {@link toAppRelative} and {@link toFullPath}.
 *
 * **Query string preservation:** The adapter always carries forward
 * `currentURL.search` to the output URL, ensuring query parameters
 * (e.g. `?routingStrategy=custom`) survive navigation.
 *
 * @returns A {@link ContextNavigationAdapterFactory} that produces a custom adapter when the
 *          app context exposes both `extractContextIdFromPath` and `generatePathFromContext`,
 *          or `null` to fall through to the next adapter in the resolution chain.
 */
export function createCustomAdapter(): ContextNavigationAdapterFactory {
  return ({ appContext, appKey, routingStrategy }): ContextNavigationAdapter | null => {
    // Explicit query routing must not interpret app route slugs as context ids.
    if (routingStrategy === 'query') {
      return null;
    }

    // This app hasn't registered custom context hooks — let a lower-priority adapter handle it
    if (!hasCustomContextGenerators(appContext)) {
      return null;
    }

    const appBasename = `/apps/${appKey}`;
    const rawExtract = appContext.extractContextIdFromPath;
    const rawGenerate = appContext.generatePathFromContext;

    // Both hooks must be present; if one is missing the custom URL contract can't be fulfilled
    if (!rawExtract || !rawGenerate) {
      return null;
    }

    // Capture narrowed references — TypeScript can't narrow across the closure boundary
    const extract = rawExtract;
    const generate = rawGenerate;

    return {
      id: 'custom',

      // The app's hooks define the URL shape, so the URL is the source of truth.
      appOwnsUrl: true,

      /** Always true — selection already happened in the factory guard above. */
      canHandle(): boolean {
        return true;
      },

      /**
       * Encode a context into the URL using the app's path generator.
       *
       * - **Null context on a context-free route:** stays on the current route.
       * - **Null context on a context route:** navigates to the app root.
       * - **Existing context in URL:** replaces it with the new context id,
       *   preferring the app generator's output, falling back to string replacement.
       * - **No existing context:** delegates entirely to the app generator.
       *
       * Returns `null` when the generator cannot produce a path and no existing
       * context ID is available for the fallback replacement.
       */
      encode({
        context,
        currentURL,
      }: {
        context: ContextItem | null;
        currentURL: URL;
      }): URL | null {
        const appRelativePath = toAppRelative(currentURL.pathname, appBasename);
        const existingContextId = normalizeStringResult(extract(appRelativePath)) ?? undefined;

        if (context === null) {
          // Stay on a route without context (e.g. the app cleared context itself);
          // leaving a context route returns to the app root.
          const url = new URL(
            existingContextId ? appBasename : currentURL.pathname,
            currentURL.origin,
          );
          url.search = currentURL.search;
          // Remove query-adapter param — custom apps encode context in the path
          stripContextQueryParam(url);
          // Hash is intentionally not preserved
          return url;
        }

        let generatedPath: string | undefined;

        // Context already lives in the URL — keep the existing fallback semantics when the
        // generator cannot create a route.
        if (existingContextId) {
          generatedPath =
            normalizeStringResult(generate(context, appRelativePath)) ??
            appRelativePath.replace(existingContextId, context.id);
        } else {
          // No context in the current URL — ask the generator where to place the new context id
          generatedPath = normalizeStringResult(generate(context, appRelativePath));
        }

        // Generator returned nothing — can't produce a valid URL; skip navigation
        if (!generatedPath) {
          return null;
        }

        const fullPath = toFullPath(generatedPath, appBasename);
        const url = new URL(fullPath, currentURL.origin);
        url.search = currentURL.search;
        // Remove query-adapter param — custom apps encode context in the path
        stripContextQueryParam(url);
        // Hash is intentionally not preserved — context changes reset app to root view
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
