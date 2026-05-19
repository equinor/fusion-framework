import type { IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Check whether an app's context provider has custom path generators registered.
 *
 * Returns `true` when both `extractContextIdFromPath` and
 * `generatePathFromContext` are present, indicating the app owns its own
 * URL shape and should be handled by the custom adapter.
 */
export function hasCustomContextGenerators(appContext: IContextProvider): boolean {
  return !!appContext.extractContextIdFromPath && !!appContext.generatePathFromContext;
}
