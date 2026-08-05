import type { IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Check whether an app's context provider has custom path generators registered.
 *
 * Returns `true` when both `extractContextIdFromPath` and
 * `generatePathFromContext` are present, indicating the app owns its own
 * URL shape and should be handled by the custom adapter.
 *
 * @param appContext - The app's context provider instance.
 * @returns `true` if the app has custom context generators, `false` otherwise.
 */
export function hasCustomContextGenerators(appContext: IContextProvider): boolean {
  return !!appContext.extractContextIdFromPath && !!appContext.generatePathFromContext;
}
