export type { INavigationConfigurator } from './NavigationConfigurator.interface';
export { NavigationConfigurator } from './NavigationConfigurator';

export { NavigationModule, module, moduleKey } from './module';
export { enableNavigation } from './enable-navigation';

export type { INavigationProvider } from './NavigationProvider.interface';
export { NavigationProvider } from './NavigationProvider';

export { createHistory } from './lib/create-history';

export {
  NavigateEvent,
  NavigatedEvent,
  type NavigateEventDetail,
  type NavigatedEventDetail,
} from './events';

export type {
  Path,
  To,
  Location,
  History,
  NavigationBlocker,
  NavigationListener,
} from './lib/types';

/**
 * @deprecated use History instead
 */
export type { History as INavigator } from './lib';
