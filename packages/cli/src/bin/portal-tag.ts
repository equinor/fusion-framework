import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import type { FusionFramework } from './framework.node.js';

import { chalk, formatPath, type ConsoleLogger } from './utils/index.js';

/**
 * Allowed tags for portal versions in the portal service.
 *
 * - `latest`: Marks the most recent stable version of the portal template.
 * - `preview`: Marks a pre-release or preview version for testing or review.
 *
 * Used by {@link tagPortal} to validate and apply version tags.
 *
 * @public
 */
export enum AllowedTags {
  Latest = 'latest',
  Preview = 'preview',
}

/**
 * Options for tagging a portal template version in the portal service.
 *
 * This type defines the required and optional parameters for the
 * {@link tagPortal} function, including the tag type, portal name,
 * version, framework instance, and logger.
 *
 * @property tag - The tag to apply to the portal version (e.g., 'latest' or 'preview').
 * @property name - The unique name identifying the portal template.
 * @property version - The version of the portal template to tag.
 * @property framework - The FusionFramework instance used for service discovery and requests.
 * @property log - Optional logger for outputting progress and debug information.
 *
 * @public
 */
export type TagPortalOptions = {
  tag: AllowedTags;
  name: string;
  version: string;
  framework: FusionFramework;
  log?: ConsoleLogger | null;
};

/**
 * Tags a portal template version in the portal service with a specified tag (e.g., 'latest' or 'preview').
 *
 * This function validates input, creates a client for the portal service, and sends a tag request.
 * It provides detailed logging and error handling for common failure scenarios.
 *
 * @param options - Tag, portal name, version, framework instance, and logger.
 * @returns The result of the tag operation from the portal service.
 * @throws If the tag, name, or version is invalid, or if the tag operation fails.
 * @public
 */
export const tagPortal = async (options: TagPortalOptions) => {
  const { tag, name, version, framework, log } = options;

  // Validate tag value
  if (!['latest', 'preview'].includes(tag)) {
    log?.fail('🤪', 'Invalid tag. Use "latest" or "preview".');
    process.exit(1);
  }
  // Validate portal name
  if (!name) {
    log?.fail('🤪', 'Portal name is required.');
    process.exit(1);
  }
  // Validate version
  if (!version) {
    log?.fail('🤪', 'Version is required.');
    process.exit(1);
  }

  // Log the tagging action for traceability
  log?.info('Tagging portal:', chalk.greenBright(`${name}@${tag}`, version));

  // Create a client for the 'portal-config' service
  const client = await framework.serviceDiscovery.createClient('portal-config');
  // Subscribe to outgoing requests for logging and debugging
  client.request$.subscribe((request: FetchRequest) => {
    log?.debug('Request:', request);
    log?.info('🌎', 'Executing request to:', formatPath(request.uri));
  });

  log?.start('Tagging portal template...');
  try {
    // Send a PUT request to tag the portal template version
    const response = await client.json(`/templates/${name}/tags/${tag}`, {
      method: 'PUT',
      body: { version },
    });
    log?.debug('Response:', response);
    log?.succeed('Tagged portal template successfully');
    log?.info('🚀', JSON.stringify(response));
  } catch (error) {
    // Handle known HTTP errors with specific log messages
    if (error instanceof HttpJsonResponseError) {
      const { data, response } = error;
      log?.debug('Error:', data);
      if (data) {
        log?.warn(chalk.red(`🤯 error: ${data.code}\n`), chalk.yellowBright(data.message), '\n');
      }
      switch (response?.status) {
        case 410:
          log?.fail(
            `🤬 - ${response?.status} -`,
            `${name} is deleted. Please check the name and try again.`,
          );
          break;
        case 404:
          log?.fail(
            `🤬 - ${response?.status} -`,
            `${name} not found. Please check the name and try again.`,
          );
          break;
        case 403:
        case 401:
          log?.fail(
            `🤬 - ${response?.status} -`,
            'You are not authorized to tag. Please check your permissions.',
          );
          break;
        default:
          log?.fail(`🤬 - ${response?.status} -`, 'Failed to tag', `Error: ${error.message}`);
          break;
      }
    }
    // Rethrow error for upstream handling
    throw error;
  }
};

// Export as default for compatibility with import patterns
export default tagPortal;
