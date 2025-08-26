import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAppState } from '@equinor/fusion-framework-react-app/state';

/**
 * Application configuration for the State Module Cookbook
 *
 * This configuration enables the state module, which provides the useAppState hook
 * for managing persistent application state across components.
 *
 * Key Learning: The state module must be enabled in your app configuration
 * before you can use the useAppState hook in your components.
 */
export const configure: AppModuleInitiator = (appConfigurator) => {
  // Enable the state module - this makes useAppState available throughout the app
  enableAppState(appConfigurator);
};

export default configure;
