import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';

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

export interface IContextNavigationStrategyAdapter {
  mode: RoutingExecutionMode;
  onContextChange(input: ContextChangeStrategyInput): NavigationInstruction | undefined;
  onAppSwitch(input: AppSwitchStrategyInput): NavigationInstruction | undefined;
}
