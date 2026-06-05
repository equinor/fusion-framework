// Plugin
export { createContextNavigationPlugin } from './plugin';
export type { ContextNavigationPluginArgs, ContextNavigationEventSource } from './plugin';

// Configurator
export { ContextNavigationConfigurator } from './configurator';

// Enable helper
export { enableContextNavigation } from './enable';

// Types (root-level only: config + event details)
export type {
  ContextNavigationConfig,
  ContextNavigationNavigateDetail,
  ContextNavigationNavigatedDetail,
  ContextNavigationAdapterResolvedDetail,
  ContextNavigationSkippedDetail,
} from './types';

// Legacy compat
export { enableLegacyAppNavigationFix } from './utils/legacy-app-navigation-fix';

// Events (side-effect: augments FrameworkEventMap)
import './events';

// Version
export { version } from './version';
