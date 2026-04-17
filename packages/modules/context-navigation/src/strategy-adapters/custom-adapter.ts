import type {
  AppSwitchStrategyInput,
  ContextChangeStrategyInput,
  IContextNavigationStrategyAdapter,
} from './contracts';

const readAppPrefix = (pathname: string): string | undefined => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'apps' || !parts[1]) return undefined;
  return `/apps/${parts[1]}`;
};

const toAppRelativePath = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'apps' || !parts[1]) return pathname;
  const appRelative = parts.slice(2).join('/');
  return appRelative ? `/${appRelative}` : '/';
};

const toPortalPath = (generatedPath: string, appPrefix: string | undefined): string | undefined => {
  if (generatedPath.startsWith('/apps/')) return generatedPath;
  if (!appPrefix) return undefined;
  const normalized = generatedPath.startsWith('/') ? generatedPath : `/${generatedPath}`;
  if (normalized === '/') return appPrefix;
  return `${appPrefix}${normalized}`;
};

/**
 * Custom app-owned strategy — portal uses app's hooks to understand
 * and carry context through the app's custom URL shape.
 *
 * context cleared → returns undefined (app handles its own routing)
 * context change → uses generatePathFromContext if registered
 * app switch → uses generatePathFromContext for carry-over
 */
export const customStrategyAdapter: IContextNavigationStrategyAdapter = {
  mode: 'custom',
  onContextChange(input: ContextChangeStrategyInput) {
    const appRelativePath = toAppRelativePath(input.portalPathname);
    const appPrefix = readAppPrefix(input.portalPathname);

    // Custom strategy: context cleared is fully app-owned
    if (input.newContext === null) return undefined;

    const generatedCustomPath = input.activeContextProvider?.generatePathFromContext?.(
      input.newContext,
      appRelativePath,
    );
    const normalizedPortalPath =
      generatedCustomPath && toPortalPath(generatedCustomPath, appPrefix);

    if (normalizedPortalPath) {
      return { pathname: normalizedPortalPath, search: input.portalSearch };
    }

    // No generated path — app handles routing in its own router
    return undefined;
  },
  onAppSwitch(input: AppSwitchStrategyInput) {
    const appRelativePath = toAppRelativePath(input.newPathname);
    const appPrefix = readAppPrefix(input.newPathname);
    const currentContextItem = input.activeContextProvider?.currentContext;

    const generatedCustomPath =
      currentContextItem && currentContextItem.id === input.contextIdToCarry
        ? input.activeContextProvider?.generatePathFromContext?.(
            currentContextItem,
            appRelativePath,
          )
        : undefined;
    const normalizedPortalPath =
      generatedCustomPath && toPortalPath(generatedCustomPath, appPrefix);

    if (normalizedPortalPath) {
      return { pathname: normalizedPortalPath, search: input.newSearch };
    }

    return undefined;
  },
};
