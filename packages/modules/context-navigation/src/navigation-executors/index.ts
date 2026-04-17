import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import { AppOwnedNavigationExecutor } from './app-owned-executor';
import type { INavigationExecutor } from './contracts';
import { PortalNavigationExecutor } from './portal-executor';

export type { INavigationExecutor, ExecutedNavigation } from './contracts';

export const resolveNavigationExecutor = (
  appNavigation: INavigationProvider | undefined | null,
  portalNavigation: INavigationProvider,
  appKey: string,
): INavigationExecutor => {
  if (appNavigation) {
    return new AppOwnedNavigationExecutor(appNavigation, portalNavigation, appKey);
  }
  return new PortalNavigationExecutor(portalNavigation);
};
