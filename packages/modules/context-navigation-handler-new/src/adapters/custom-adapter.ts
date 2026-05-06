import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from '../types';

/**
 * Normalize legacy app generator outputs.
 * Some apps return arrays instead of strings (e.g. `['path']` or `[]`).
 */
function normalizeStringResult(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' && first.length > 0 ? first : undefined;
  }
  return undefined;
}

/**
 * Custom adapter — uses app-provided `generatePathFromContext` and
 * `extractContextIdFromPath` hooks.
 *
 * Matches apps that either declare `routingStrategy: 'custom'` or have
 * both generator hooks registered (legacy auto-detection).
 *
 * Operates on **app-relative paths** (strips `/apps/{appKey}` prefix before
 * calling app hooks, prepends it back after).
 */
export function createCustomAdapter(): ContextNavigationAdapter {
  return {
    id: 'custom',

    canHandle({ appContext }: AdapterResolutionContext): boolean {
      if (appContext.routingStrategy === 'custom') return true;

      // Legacy auto-detection: app has both generators but no explicit strategy
      const declared = appContext.routingStrategy;
      if (declared === undefined || declared === null) {
        return !!appContext.generatePathFromContext && !!appContext.extractContextIdFromPath;
      }

      return false;
    },

    encode(context: ContextItem | null, currentURL: URL): URL | null {
      // We need to re-read the provider from the resolution context.
      // Since encode/decode are called after canHandle, we use a bound version.
      // This is handled by the factory — see createBoundCustomAdapter below.
      throw new Error('custom adapter must be created via createBoundCustomAdapter');
    },

    decode(url: URL): string | null {
      throw new Error('custom adapter must be created via createBoundCustomAdapter');
    },
  };
}

/**
 * Create a bound custom adapter for a specific app's context provider.
 * Called by the provider when the custom adapter's `canHandle` matches.
 */
export function createBoundCustomAdapter(
  appContext: IContextProvider,
  appKey: string,
): ContextNavigationAdapter {
  const appBasename = `/apps/${appKey}`;

  const rawExtract = appContext.extractContextIdFromPath!;
  const rawGenerate = appContext.generatePathFromContext!;

  function extractContextIdFromPath(path: string): string | undefined {
    return normalizeStringResult(rawExtract(path));
  }

  function generatePathFromContext(context: ContextItem, currentPath: string): string | undefined {
    return normalizeStringResult(rawGenerate(context, currentPath));
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
      return true; // Already bound — always handles
    },

    encode(context: ContextItem | null, currentURL: URL): URL | null {
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

      if (!generatedPath) return null;

      const fullPath = toFullPath(generatedPath);
      return new URL(fullPath, currentURL.origin);
    },

    decode(url: URL): string | null {
      const appRelativePath = toAppRelative(url.pathname);
      return extractContextIdFromPath(appRelativePath) ?? null;
    },
  };
}
