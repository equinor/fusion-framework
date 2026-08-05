// Plugin
export { createContextNavigationPlugin } from './create-context-navigation-plugin';
export type {
  ContextNavigationPluginArgs,
  ContextNavigationEventSource,
} from './create-context-navigation-plugin';

// Configurator
export { ContextNavigationConfigurator } from './ContextNavigationConfigurator';

// Enable helper
export { enableContextNavigation } from './enable-context-navigation';

// Types (root-level only: config + event details)
export type {
  ContextNavigationConfig,
  ContextNavigationNavigateDetail,
  ContextNavigationNavigatedDetail,
  ContextNavigationAdapterResolvedDetail,
  ContextNavigationSkippedDetail,
} from './types';

// Legacy compat
export { legacyAppNavigationFix } from './utils/legacy-app-navigation-fix';

// Events (side-effect: augments FrameworkEventMap)
import './events';

// Version
export { version } from './version';
