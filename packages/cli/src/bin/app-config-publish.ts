import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from './framework.node.js';

import { formatPath, chalk, type ConsoleLogger } from './utils/index.js';

import { generateApplicationConfig } from './app-config.js';
import { loadAppManifest } from './app-manifest.js';

type AppConfigPublishOptions = {
  config?: string;
  manifest?: string;
  environment: Exclude<FusionEnv, FusionEnv.Development>;
  auth: FusionFrameworkSettings['auth'];
  debug?: boolean;
  log?: ConsoleLogger | null;
};

/**
 * Publishes the application configuration to the app store for a specific build version.
 *
 * This function generates the application config, loads the manifest, initializes the Fusion Framework,
 * and sends the config to the app service. Handles and logs errors for common failure scenarios.
 *
 * @param options - Options for config, manifest, environment, authentication, and logging.
 * @returns A promise that resolves when publishing is complete.
 * @throws If the build version is missing or publishing fails.
 * @public
 */
export const publishAppConfig = async (options: AppConfigPublishOptions) => {
  const { log } = options;

  // Generate the application config using provided options and environment
  const { config: appConfig } = await generateApplicationConfig({
    log,
    config: options.config,
    env: { environment: options.environment },
  });

  // Load the application manifest for the specified environment
  const { manifest: appManifest } = await loadAppManifest({
    log,
    manifest: options.manifest,
    env: { environment: options.environment },
  });

  // Extract the build version from the manifest
  const appVersion = appManifest.build?.version;
  if (!appVersion) {
    // Fail if no build version is found in the manifest
    const error = new Error(
      'No build version found in the manifest. Please make sure the manifest is valid.',
    );
    log?.fail('🤪', error.message);
    throw error;
  }

  log?.start('Initializing Fusion Framework...');
  // Initialize the Fusion Framework with the provided environment and authentication
  const framework = await initializeFramework({
    env: options.environment,
    auth: options.auth,
  });
  log?.succeed('Initialized Fusion Framework');

  // Create a client for the 'apps' service
  const appClient = await framework.serviceDiscovery.createClient('apps');
  // Subscribe to outgoing requests for logging and debugging
  appClient.request$.subscribe((request: FetchRequest) => {
    log?.debug('Request:', request);
    log?.info('🌎', 'Executing request to:', formatPath(request.uri));
  });

  log?.start('Publishing application config');
  log?.info('Using environment:', chalk.redBright(options.environment));
  try {
    // Send a PUT request to publish the app config for the specific build version
    const response = await appClient.json(
      `/apps/${appManifest.appKey}/builds/${appVersion}/config`,
      {
        method: 'PUT',
        body: appConfig,
      },
    );
    log?.debug('Response:', response);
    log?.succeed('Published application config');
  } catch (error) {
    // Handle known HTTP errors with specific log messages
    if (error instanceof HttpJsonResponseError) {
      switch (error.response.status) {
        case 410:
          log?.fail(
            '🤬',
            `App ${appManifest.appKey} is deleted from apps-service. Please check the app key and try again.`,
          );
          break;
        case 404:
          log?.fail(
            '🤬',
            `App ${appManifest.appKey} not found. Please check the app key and try again.`,
          );
          break;
        case 403:
        case 401:
          log?.fail(
            '🤬',
            'You are not authorized to publish application config. Please check your permissions.',
          );
          break;
        default:
          log?.fail(
            '🤬',
            'Failed to publish application config.',
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
export default publishAppConfig;
