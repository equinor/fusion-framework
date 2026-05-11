import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, ContextNavigationAdapterFactory } from '../types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';

/**
 * Normalize legacy app generator outputs.
 * Some apps return arrays instead of strings (e.g. `['path']` or `[]`).
 */
function normalizeStringResult(value: unknown): string | undefined {
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
 * Custom adapter factory — uses app-provided `generatePathFromContext` and
 * `extractContextIdFromPath` hooks.
 *
 * Returns a bound adapter when the app has both generator hooks registered,
 * or `null` otherwise. This handles legacy apps that configured generators
 * without an explicit routing strategy.
 *
 * Operates on **app-relative paths** (strips `/apps/{appKey}` prefix before
 * calling app hooks, prepends it back after).
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

    // Capture narrowed references for use inside closures
    const extract = rawExtract;
    const generate = rawGenerate;

    function extractContextIdFromPath(path: string): string | undefined {
      return normalizeStringResult(extract(path));
    }

    function generatePathFromContext(
      context: ContextItem,
      currentPath: string,
    ): string | undefined {
      return normalizeStringResult(generate(context, currentPath));
    }

    function toAppRelative(fullPathname: string): string {
      if (fullPathname.startsWith(appBasename)) {
        const relative = fullPathname.slice(appBasename.length);
        return relative.startsWith('/') ? relative : `/${relative}`;
      }
      return fullPathname;
    }

    function toFullPath(appRelativePath: string): string {
      const base = appBasename.endsWith('/') ? appBasename.slice(0, -1) : appBasename;
      const rel = appRelativePath.startsWith('/') ? appRelativePath : `/${appRelativePath}`;
      return `${base}${rel}`;
    }

    return {
      id: 'custom',

      canHandle(): boolean {
        return true;
      },

      encode({ context, currentURL }: { context: ContextItem | null; currentURL: URL }): URL | null {
        if (context === null) {
          return new URL(`${appBasename}/`, currentURL.origin);
        }

        const appRelativePath = toAppRelative(currentURL.pathname);
        const existingContextId = extractContextIdFromPath(appRelativePath);

        let generatedPath: string | undefined;

        if (existingContextId) {
          generatedPath =
            generatePathFromContext(context, appRelativePath) ??
            appRelativePath.replace(existingContextId, context.id);
        } else {
          generatedPath = generatePathFromContext(context, appRelativePath);
        }

        if (!generatedPath) {
          return null;
        }

        const fullPath = toFullPath(generatedPath);
        return new URL(fullPath, currentURL.origin);
      },

      decode(url: URL): string | null {
        const appRelativePath = toAppRelative(url.pathname);
        return extractContextIdFromPath(appRelativePath) ?? null;
      },
    };
  };
}
