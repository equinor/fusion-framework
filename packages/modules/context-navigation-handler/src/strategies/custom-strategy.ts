import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { ContextRoutingStrategy } from '../types';

export interface CustomStrategyOptions {
  /** App-provided function to extract context id from a URL path. */
  extractContextIdFromPath: (path: string) => string | undefined;
  /** App-provided function to generate a path for a given context. */
  generatePathFromContext: (context: ContextItem, currentPath: string) => string | undefined;
  /** The app's basename prefix (e.g. `/apps/my-app`). Stripped before calling app hooks. */
  appBasename: string;
}

/**
 * Custom strategy — app defines its own URL encoding/decoding logic.
 *
 * Factory function that creates a strategy from the app's
 * `extractContextIdFromPath` and `generatePathFromContext` hooks.
 *
 * The app's hooks operate on **app-relative paths** (basename stripped),
 * so this strategy handles the translation to/from full portal URLs.
 */
export function createCustomStrategy(options: CustomStrategyOptions): ContextRoutingStrategy {
  const { appBasename, extractContextIdFromPath, generatePathFromContext } = options;

  /** Strip the app basename prefix from a full pathname to get the app-relative path. */
  function toAppRelative(fullPathname: string): string {
    if (fullPathname.startsWith(appBasename)) {
      const relative = fullPathname.slice(appBasename.length);
      return relative.startsWith('/') ? relative : `/${relative}`;
    }
    return fullPathname;
  }

  /** Prepend the app basename to an app-relative path to get the full portal path. */
  function toFullPath(appRelativePath: string): string {
    const base = appBasename.endsWith('/') ? appBasename.slice(0, -1) : appBasename;
    const rel = appRelativePath.startsWith('/') ? appRelativePath : `/${appRelativePath}`;
    return `${base}${rel}`;
  }

  return {
    id: 'custom',

    encode(context: ContextItem | null, currentURL: URL): URL | null {
      if (context === null) {
        // Clear context → navigate to app root
        return new URL(`${appBasename}/`, currentURL.origin);
      }

      const appRelativePath = toAppRelative(currentURL.pathname);
      const existingContextId = extractContextIdFromPath(appRelativePath);

      let generatedPath: string | undefined;

      if (existingContextId) {
        // Context id already in URL — use generatePathFromContext or simple replacement
        generatedPath =
          generatePathFromContext(context, appRelativePath) ??
          appRelativePath.replace(existingContextId, context.id);
      } else {
        // No context in URL — ask the app to generate a path.
        // If it can't (returns undefined), this context is not supported — skip.
        generatedPath = generatePathFromContext(context, appRelativePath);
      }

      if (!generatedPath) return null;

      const fullPath = toFullPath(generatedPath);
      const url = new URL(fullPath, currentURL.origin);
      url.search = currentURL.search;
      return url;
    },

    decode(url: URL): string | null {
      const appRelativePath = toAppRelative(url.pathname);
      return extractContextIdFromPath(appRelativePath) ?? null;
    },
  };
}

/**
 * Normalize legacy app generator outputs.
 * Some apps return arrays instead of strings (e.g. `['path']` or `[]`).
 */
function normalizeStringResult(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value)) {
    // Legacy apps return ['path'] or [] — take first element or undefined
    const first = value[0];
    return typeof first === 'string' && first.length > 0 ? first : undefined;
  }
  return undefined;
}

/**
 * Build a custom strategy from an app's context provider.
 * Returns `null` if the provider lacks the required hooks.
 *
 * Wraps the app's generators with normalization to handle legacy apps
 * that return arrays instead of strings.
 *
 * @param provider - The app's context provider with extract/generate functions.
 * @param appKey - The app key, used to derive the basename (`/apps/{appKey}`).
 */
export function createCustomStrategyFromProvider(
  provider: IContextProvider,
  appKey: string,
): ContextRoutingStrategy | null {
  if (!provider.extractContextIdFromPath || !provider.generatePathFromContext) {
    return null;
  }

  const rawExtract = provider.extractContextIdFromPath;
  const rawGenerate = provider.generatePathFromContext;

  return createCustomStrategy({
    extractContextIdFromPath: (path: string) => normalizeStringResult(rawExtract(path)),
    generatePathFromContext: (context: ContextItem, currentPath: string) =>
      normalizeStringResult(rawGenerate(context, currentPath)),
    appBasename: `/apps/${appKey}`,
  });
}
