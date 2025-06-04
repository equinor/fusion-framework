import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';

import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from '../lib/framework.node.js';

import { formatPath, chalk, type ConsoleLogger } from './utils';

import { generatePortalConfig } from './portal-config.js';

type PortalConfigPublishOptions = {
  config?: string;
  portal: {
    name: string;
    version: string;
  };
  environment: Exclude<FusionEnv, FusionEnv.Development>;
  auth: FusionFrameworkSettings['auth'];
  debug?: boolean;
  log?: ConsoleLogger | null;
};

/**
 * Publishes the portal configuration to the portal store for a specific build version.
 *
 * This function generates the portal config, loads the manifest, initializes the Fusion Framework,
 * and sends the config to the portal service. Handles and logs errors for common failure scenarios.
 *
 * @param options - Options for config, manifest, environment, authentication, and logging.
 * @returns A promise that resolves when publishing is complete.
 * @throws If the build version is missing or publishing fails.
 * @public
 */
export const publishPortalConfig = async (options: PortalConfigPublishOptions) => {
  const { log, portal } = options;

  // Generate the portal config using provided options and environment
  const { config: portalConfig } = await generatePortalConfig({
    log,
    config: options.config,
    env: { environment: options.environment },
  });

  log?.start('Initializing Fusion Framework...');
  // Initialize the Fusion Framework with the provided environment and authentication
  const framework = await initializeFramework({
    env: options.environment,
    auth: options.auth,
  });
  log?.succeed('Initialized Fusion Framework');

  // Create a client for the 'portals' service
  const portalClient = await framework.serviceDiscovery.createClient('portals');
  // Subscribe to outgoing requests for logging and debugging
  portalClient.request$.subscribe((request) => {
    log?.debug('Request:', request);
    log?.info('🌎', 'Executing request to:', formatPath(request.uri));
  });

  log?.start('Publishing portal config');
  log?.info('Using environment:', chalk.redBright(options.environment));
  try {
    // Send a PUT request to publish the portal config for the specific build version
    const response = await portalClient.json(`/portals/${portal.name}@${portal.version}/config`, {
      method: 'PUT',
      body: portalConfig,
    });
    log?.debug('Response:', response);
    log?.succeed('Published portal config');
  } catch (error) {
    // Handle known HTTP errors with specific log messages
    if (error instanceof HttpJsonResponseError) {
      switch (error.response.status) {
        case 410:
          log?.fail(
            '🤬',
            `Portal ${portal.name} is deleted from portals-service. Please check the portal key and try again.`,
          );
          break;
        case 404:
          log?.fail(
            '🤬',
            `Portal ${portal.name} not found. Please check the portal key and try again.`,
          );
          break;
        case 403:
        case 401:
          log?.fail(
            '🤬',
            'You are not authorized to publish portal config. Please check your permissions.',
          );
          break;
        default:
          log?.fail(
            '🤬',
            'Failed to publish portal config.',
            `Status code: ${error.response.status}`,
            `Message: ${error.response.statusText}`,
          );
          break;
      }
    }
    // Rethrow error for upstream handling
    throw error;
  }
};

// Export as default for compatibility with import patterns
export default publishPortalConfig;
