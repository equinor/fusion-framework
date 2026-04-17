import type { IContextProvider } from '@equinor/fusion-framework-module-context';

/**
 * Merges app-level and portal-level context providers.
 * App-level overrides are preferred; portal is fallback.
 */
export const mergeContextProviders = (
  appProvider: IContextProvider | undefined,
  portalProvider: IContextProvider,
): IContextProvider =>
  ({
    version: appProvider?.version ?? portalProvider.version,
    routingStrategy: appProvider?.routingStrategy ?? portalProvider.routingStrategy,
    currentContext: appProvider?.currentContext ?? portalProvider.currentContext,
    extractContextIdFromPath: (pathname) =>
      appProvider?.extractContextIdFromPath?.(pathname) ??
      portalProvider.extractContextIdFromPath?.(pathname),
    generatePathFromContext: (context, currentPathname) =>
      appProvider?.generatePathFromContext?.(context, currentPathname) ??
      portalProvider.generatePathFromContext?.(context, currentPathname),
  }) as IContextProvider;
