import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';

// export interface NavigationInstruction {
//   pathname: string;
//   search?: string;
// }

// export interface ContextChangeStrategyInput {
//   newContext: ContextItem | null;
//   activeContextProvider: IContextProvider;
//   portalPathname: string;
//   portalSearch: string;
// }

// export interface AppSwitchStrategyInput {
//   newPathname: string;
//   newSearch: string;
//   contextIdToCarry: string;
//   activeContextProvider: IContextProvider;
// }

// export interface IContextNavigationStrategyAdapter {
//   mode: RoutingExecutionMode;
//   onContextChange(input: ContextChangeStrategyInput): NavigationInstruction | undefined;
//   onAppSwitch(input: AppSwitchStrategyInput): NavigationInstruction | undefined;
// }

export interface NavigationInstruction {
  pathname: string;
  search?: string;
}

export interface ContextChangeStrategyInput {
  newContext: ContextItem | null;
  activeContextProvider: IContextProvider;
  portalPathname: string;
  portalSearch: string;
}

export interface AppSwitchStrategyInput {
  newPathname: string;
  newSearch: string;
  contextIdToCarry: string;
  activeContextProvider: IContextProvider;
}

export interface NoContextInput {
  appKey: string;
  mode: RoutingExecutionMode;
  currentPathname: string;
  currentSearch: string;
}

export interface OnAppNavigationInput {
  appKey: string;
  currentPathname: string;
  currentSearch: string;
}

/**
 * Called when context is cleared (null). Returns a navigation instruction
 * that replaces the default adapter behavior, or `undefined` to fall through.
 */
export interface ClearContextInput {
  appKey: string;
  mode: RoutingExecutionMode;
  currentPathname: string;
  currentSearch: string;
}

export interface IContextNavigationStrategyAdapter<
  T extends RoutingExecutionMode = RoutingExecutionMode,
> {
  mode: T;
  onNonContext?(input: NoContextInput): NavigationInstruction | undefined;
  onClearContext?(input: ClearContextInput): NavigationInstruction | undefined;
  appContextHandler?(): NavigationInstruction | undefined;
  portalContextHandler?(): NavigationInstruction | undefined;
  onAppNavigation?(input: OnAppNavigationInput): NavigationInstruction | undefined;
  onNavigation?(input: ContextChangeStrategyInput): NavigationInstruction | undefined;
}
