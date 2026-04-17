import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { NavigationInstruction } from '../strategy-adapters/contracts';
import type { ExecutedNavigation, INavigationExecutor } from './contracts';

/**
 * Executor for apps that register their own NavigationModule.
 *
 * Routes URL writes through the portal router so the browser address bar
 * updates. The executor is instruction-driven — it does NOT decide where
 * to navigate. That responsibility belongs to the strategy adapter.
 *
 * For legacy app routers (version < 7), an explicit `replace('/')` reset
 * is performed when context is cleared so the app's internal router state
 * stays in sync.
 */
export class AppOwnedNavigationExecutor implements INavigationExecutor {
  readonly type = 'app-owned';

  constructor(
    private readonly appNavigation: INavigationProvider,
    private readonly portalNavigation: INavigationProvider,
    private readonly appKey: string,
  ) {}

  get workingPathname(): string {
    const appPath = this.appNavigation.path.pathname;
    const normalized = appPath.startsWith('/') ? appPath : `/${appPath}`;
    return `/apps/${this.appKey}${normalized}`;
  }

  get workingSearch(): string {
    return this.appNavigation.path.search ?? '';
  }

  execute(
    context: ContextItem | null,
    instruction: NavigationInstruction | undefined,
  ): ExecutedNavigation | undefined {
    if (!instruction) return undefined;

    /**
     * Legacy app routers (< v7) maintain their own internal route state.
     * When context is cleared, we must explicitly reset the app router
     * to '/' so it doesn't hold stale context in its internal state.
     */
    if (context === null && this.appNavigation.version.major < 7) {
      this.appNavigation.replace('/');
    }

    const portalPrefix = `/apps/${this.appKey}`;
    const appRelativePathname = instruction.pathname.startsWith(portalPrefix)
      ? instruction.pathname.slice(portalPrefix.length) || '/'
      : instruction.pathname;

    const url = this.appNavigation.createURL({ pathname: appRelativePathname });
    this.portalNavigation.navigate(
      {
        ...this.portalNavigation.path,
        pathname: url.pathname,
        search: instruction.search || url.search || undefined,
      },
      { replace: true },
    );

    return { pathname: instruction.pathname, search: instruction.search ?? '' };
  }
}
