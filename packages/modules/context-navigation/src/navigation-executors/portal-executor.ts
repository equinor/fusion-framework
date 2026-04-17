import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { NavigationInstruction } from '../strategy-adapters/contracts';
import type { ExecutedNavigation, INavigationExecutor } from './contracts';

/**
 * Executor for apps without their own NavigationModule.
 * Writes all URL updates directly to the portal INavigationProvider.
 *
 * Instruction-driven — the strategy adapter decides the target URL,
 * this executor just writes it.
 */
export class PortalNavigationExecutor implements INavigationExecutor {
  readonly type = 'portal';

  constructor(private readonly portalNavigation: INavigationProvider) {}

  get workingPathname(): string {
    return this.portalNavigation.path.pathname;
  }

  get workingSearch(): string {
    return this.portalNavigation.path.search ?? '';
  }

  execute(
    _context: ContextItem | null,
    instruction: NavigationInstruction | undefined,
  ): ExecutedNavigation | undefined {
    if (!instruction) return undefined;

    const nextSearch = instruction.search ?? this.portalNavigation.path.search;

    /** Skip no-op navigation to avoid unnecessary history entries. */
    if (
      this.portalNavigation.path.pathname === instruction.pathname &&
      this.portalNavigation.path.search === nextSearch
    ) {
      return undefined;
    }

    this.portalNavigation.navigate(
      {
        ...this.portalNavigation.path,
        pathname: instruction.pathname,
        search: nextSearch || undefined,
      },
      { replace: true },
    );

    return { pathname: instruction.pathname, search: nextSearch ?? '' };
  }
}
