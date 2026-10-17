import type { FusionModulesInstance } from '@equinor/fusion-framework';
import type { IModuleConfigurator } from '@equinor/fusion-framework-module';
import http, { type HttpMsalModule } from '@equinor/fusion-framework-module-http';

import { version } from '../version.js';
import { createAppIdentificationOperator } from './create-app-identification-operator.js';
import { resolveAllowedOrigins } from './resolve-allowed-origins.js';
import type { AppIdentificationSettings, AppIdentity } from './types.js';

/**
 * Creates an HTTP module configurator that adds the app identification operator to the
 * app's default request handler.
 *
 * Settings are read through `getSettings` when the module is configured, which happens
 * after the app's own configure callback, so options set there are already applied.
 *
 * @param identity - The app key and version from the manifest.
 * @param getSettings - Returns the current identification settings.
 * @returns A module configurator for the app's HTTP module.
 */
export const createAppIdentificationConfig = <TRef extends FusionModulesInstance>(
  identity: Omit<AppIdentity, 'frameworkVersion'>,
  getSettings: () => AppIdentificationSettings,
): IModuleConfigurator<HttpMsalModule, TRef> => ({
  module: http,
  configure: async (config, ref) => {
    const { enabled, allowedOrigins } = getSettings();
    // The app opted out, so leave the request pipeline untouched
    if (!enabled) {
      return;
    }
    const origins = await resolveAllowedOrigins(allowedOrigins, ref?.serviceDiscovery);
    config.defaultHttpRequestHandler.set(
      'fusion-app-identification',
      createAppIdentificationOperator({ ...identity, frameworkVersion: version }, origins),
    );
  },
});
