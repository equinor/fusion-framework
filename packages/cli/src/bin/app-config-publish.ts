import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import type { FusionFramework } from './framework.node.js';

import {
  formatPath,
  type ConsoleLogger,
  defaultHeaders,
  formatAuthError,
  formatTokenAcquisitionError,
} from './utils/index.js';

import type { ApiAppConfig } from '../lib/app/schemas.js';

/**
 * Options for publishing an application configuration to the app service.
 *
 * @property config - The validated application configuration object to publish.
 * @property appKey - The unique key identifying the application in the app store.
 * @property buildVersion - The build version to associate the config with.
 * @property framework - The initialized FusionFramework instance for service discovery.
 * @property log - Optional logger for outputting progress and debug information.
 */
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

  // Create a client for the 'apps' service — inside try/catch to
  // handle token acquisition failures (e.g. expired refresh tokens).
  try {
    const appClient = await framework.serviceDiscovery.createClient('apps');
    // Subscribe to outgoing requests for logging and debugging
    appClient.request$.subscribe((request: FetchRequest) => {
      log?.debug('Request:', request);
      log?.info('🌎', 'Executing request to:', formatPath(request.uri));
    });

    log?.start('Publishing application config');
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
        case 403: // falls through
        case 401: {
          const authMsg = formatAuthError(error.response.status, `publish config for ${appKey}`);
          log?.fail('🔒', 'Authentication/authorization error publishing app config.');
          if (authMsg) {
            log?.error(authMsg);
          }
          process.exit(1);
          break;
        }
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
    // Surface MSAL token acquisition failures with actionable guidance
    const tokenMsg = formatTokenAcquisitionError(error, `publish config for ${appKey}`);
    if (tokenMsg) {
      log?.fail('🔒', `Token acquisition failed publishing config for ${appKey}`);
      log?.error(tokenMsg);
      process.exit(1);
    }
    // Unknown error — log message only, no stack trace
    log?.fail(
      '🤬',
      'Failed to publish app config:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

// Export as default for compatibility with import patterns
export default publishAppConfig;
