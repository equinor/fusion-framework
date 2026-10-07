// Plugin
export { createContextNavigationPlugin } from './create-context-navigation-plugin.js';
export type {
  ContextNavigationPluginArgs,
  ContextNavigationEventSource,
} from './create-context-navigation-plugin.js';

// Configurator
export { ContextNavigationConfigurator } from './ContextNavigationConfigurator.js';

// Enable helper
export { enableContextNavigation } from './enable-context-navigation.js';

// Types (root-level only: config + event details)
export type {
  ContextNavigationConfig,
  ContextNavigationNavigateDetail,
  ContextNavigationNavigatedDetail,
  ContextNavigationAdapterResolvedDetail,
  ContextNavigationSkippedDetail,
} from './types.js';

// Legacy compat
export { legacyAppNavigationFix } from './utils/legacy-app-navigation-fix.js';

// Events (side-effect: augments FrameworkEventMap)
import './events.js';

// Version
export { version } from './version.js';
