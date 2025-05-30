import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';

import type { FusionFramework } from '../lib';
import { type ConsoleLogger, formatPath, chalk } from './utils';

/**
 * Allowed tags for application versions in the app service.
 *
 * - `latest`: Marks the most recent stable version of the application.
 * - `preview`: Marks a pre-release or preview version for testing or review.
 *
 * Used by {@link tagApplication} to validate and apply version tags.
 *
 * @public
 */
export enum AllowedTags {
  Latest = 'latest',
  Preview = 'preview',
}

/**
 * Options for tagging an application version in the app service.
 *
 * This interface defines the required and optional parameters for the
 * {@link tagApplication} function, including the tag type, application key,
 * version, framework instance, and logger.
 *
 * @property tag - The tag to apply to the application version (e.g., 'latest' or 'preview').
 * @property appKey - The unique key identifying the application.
 * @property version - The version of the application to tag.
 * @property framework - The FusionFramework instance used for service discovery and requests.
 * @property log - Optional logger for outputting progress and debug information.
 *
 * @public
 */
export type TagApplicationOptions = {
  tag: AllowedTags;
  appKey: string;
  version: string;
  framework: FusionFramework;
  log?: ConsoleLogger | null;
};

/**
 * Tags an application version in the app service with a specified tag (e.g., 'latest' or 'preview').
 *
 * This function validates input, creates a client for the app service, and sends a tag request.
 * It provides detailed logging and error handling for common failure scenarios.
 *
 * @param options - Tag, app key, version, framework instance, and logger.
 * @returns The result of the tag operation from the app service.
 * @throws If the tag, app key, or version is invalid, or if the tag operation fails.
 * @public
 */
export const tagApplication = async (options: TagApplicationOptions) => {
  const { tag, appKey, version, framework, log } = options;

  // Validate tag value
  if (!['latest', 'preview'].includes(tag)) {
    log?.fail('🤪', 'Invalid tag. Use "latest" or "preview".');
    process.exit(1);
  }
  // Validate app key
  if (!appKey) {
    log?.fail('🤪', 'Application key is required.');
    process.exit(1);
  }
  // Validate version
  if (!version) {
    log?.fail('🤪', 'Version is required.');
    process.exit(1);
  }

  // Create a client for the 'apps' service
  const appClient = await framework.serviceDiscovery.createClient('apps');
  // Subscribe to outgoing requests for logging and debugging
  appClient.request$.subscribe((request) => {
    log?.debug('Request:', request);
    log?.info('🌎', 'Executing request to:', formatPath(request.uri));
  });

  log?.start('Publishing application config');
  try {
    // Send a PUT request to tag the application version
    const result = await appClient.json(`/apps/${appKey}/tags/${tag}`, {
      method: 'PUT',
      body: { version },
    });
    log?.debug('Response:', result);
    log?.succeed(
      'Tagged application successfully',
      chalk.greenBright(`${appKey}@${version} - ${tag}`),
    );
    return result;
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
            'You are not authorized to tag application. Please check your permissions.',
          );
          break;
        default:
          log?.fail(
            '🤬',
            'Failed to tag application',
            `Status code: ${error.response.status}`,
            `Error: ${error.message}`,
          );
          break;
      }
    }
    // Rethrow error for upstream handling
    throw error;
  }
};

// Export as default for compatibility with import patterns
export default tagApplication;
