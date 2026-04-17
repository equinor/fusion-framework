import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { NavigationInstruction } from '../strategy-adapters/contracts';

export interface ExecutedNavigation {
  pathname: string;
  search: string;
}

export interface INavigationExecutor {
  readonly type: string;
  readonly workingPathname: string;
  readonly workingSearch: string;
  execute(
    context: ContextItem | null,
    instruction: NavigationInstruction | undefined,
  ): ExecutedNavigation | undefined;
}
