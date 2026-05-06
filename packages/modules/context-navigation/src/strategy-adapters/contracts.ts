import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

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

export type NavigationInstruction = URL;

export interface ContextChangeStrategyInput {
  appKey: string;
  mode: RoutingExecutionMode;
  currentContext: ContextItem;
  activeContextProvider: IContextProvider;
}

export interface AppSwitchStrategyInput {
  appKey: string;
  mode: RoutingExecutionMode;
  newPathname: string;
  newSearch: string;
  contextIdToCarry: string;
  activeContextProvider: IContextProvider;
}

export interface OnAppNavigationInput {
  appKey: string;
  mode: RoutingExecutionMode;
  currentPathname: string;
  currentSearch: string;
}

export interface ContextHandlerInput {
  appKey: string;
  mode: RoutingExecutionMode;
  origin: string;
  appNavigation?: INavigationProvider;
  portalNavigation: INavigationProvider;
  currentContext: ContextItem | null;
  contextProvider: IContextProvider;
  // biome-ignore lint/suspicious/noExplicitAny: Adapters can define their own log signature, but must provide a logging function on the input.
  log: (message: string, ...args: any[]) => void;
}

/**
 * Called when context is cleared (null). Returns a navigation instruction
 * that replaces the default adapter behavior, or `undefined` to fall through.
 */
export interface ContextInput {
  appKey: string;
  mode: RoutingExecutionMode;
  origin: string;
  appContextProvider?: IContextProvider;
  appNavigation?: INavigationProvider;
  portalNavigation: INavigationProvider;
  portalContextProvider: IContextProvider;
  currentPathname: string;
  currentSearch: string;
  // biome-ignore lint/suspicious/noExplicitAny: Adapters can define their own log signature, but must provide a logging function on the input.
  log: (message: string, ...args: any[]) => void;
}

export interface IContextNavigationStrategyAdapter<
  T extends RoutingExecutionMode = RoutingExecutionMode,
> {
  mode: T;
  onNonContext?(input: ContextInput): NavigationInstruction | undefined;
  onClearContext?(input: ContextInput): NavigationInstruction | undefined;
  appContextHandler?(input: ContextHandlerInput): NavigationInstruction | undefined;
  portalContextHandler?(input: ContextHandlerInput): NavigationInstruction | undefined;
  onContextChange?(input: ContextChangeStrategyInput): NavigationInstruction | undefined;
  onAppSwitch?(input: AppSwitchStrategyInput): NavigationInstruction | undefined;
}
