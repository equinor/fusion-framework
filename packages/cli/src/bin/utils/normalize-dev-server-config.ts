import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

/**
 * Normalizes dev server configuration details for consistent logging.
 * Extracts relevant configuration fields into a standardized object format.
 *
 * @param config - The dev server configuration to normalize
 * @returns Normalized configuration object for logging
 */
export const normalizeDevServerConfig = (config: DevServerOptions) => ({
  portal: typeof config.spa?.templateEnv === 'object' ? config.spa.templateEnv.portal : undefined,
  msal: typeof config.spa?.templateEnv === 'object' ? config.spa.templateEnv.msal : undefined,
  proxy:
    typeof config.spa?.templateEnv === 'object'
      ? config.spa.templateEnv.serviceWorker?.resources
      : undefined,
  serviceDiscoveryUrl: config.api.serviceDiscoveryUrl,
  routes: config.api.routes,
});
