import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import type { FusionFramework } from './framework.node.js';

import { formatPath, type ConsoleLogger, defaultHeaders } from './utils/index.js';

import type { ApiAppConfig } from '../lib/app/schemas.js';

type AppConfigPublishOptions = {
  config: ApiAppConfig;
  appKey: string;
  buildVersion: string;
  framework: FusionFramework;
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
  const { log, config, appKey, buildVersion, framework } = options;

  // Create a client for the 'apps' service
  const appClient = await framework.serviceDiscovery.createClient('apps');
  // Subscribe to outgoing requests for logging and debugging
  appClient.request$.subscribe((request: FetchRequest) => {
    log?.debug('Request:', request);
    log?.info('🌎', 'Executing request to:', formatPath(request.uri));
  });

  log?.start('Publishing application config');
  try {
    // Send a PUT request to publish the app config for the specific build version
    // The API expects the config to be wrapped in a 'request' field
    const response = await appClient.json(`/apps/${appKey}/builds/${buildVersion}/config`, {
      method: 'PUT',
      body: config,
      headers: defaultHeaders,
    });
    log?.debug('Response:', response);
    log?.succeed('Published application config');
  } catch (error) {
    // Handle known HTTP errors with specific log messages
    if (error instanceof HttpJsonResponseError) {
      switch (error.response.status) {
        case 410:
          log?.fail(
            '🤬',
            `App ${appKey} is deleted from apps-service. Please check the app key and try again.`,
          );
          break;
        case 404:
          log?.fail('🤬', `App ${appKey} not found. Please check the app key and try again.`);
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
