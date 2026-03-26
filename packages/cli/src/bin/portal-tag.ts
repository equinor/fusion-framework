import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http/errors';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import type { FusionFramework } from './framework.node.js';

import { chalk, formatPath, type ConsoleLogger, defaultHeaders, formatAuthError, formatTokenAcquisitionError } from './utils/index.js';

/**
 * Options for tagging a portal template version in the portal service.
 *
 * This type defines the required and optional parameters for the
 * {@link tagPortal} function, including the tag type, portal name,
 * version, framework instance, and logger.
 *
 * @property tag - The tag to apply to the portal version (any string value).
 * @property name - The unique name identifying the portal template.
 * @property version - The version of the portal template to tag.
 * @property framework - The FusionFramework instance used for service discovery and requests.
 * @property log - Optional logger for outputting progress and debug information.
 *
 * @public
 */
export type TagPortalOptions = {
  tag: string;
  name: string;
  version: string;
  framework: FusionFramework;
  log?: ConsoleLogger | null;
};

/**
 * Tags a portal template version in the portal service with a specified tag.
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

  // Validate tag value - ensure it's a non-empty string
  if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
    log?.fail('🤪', 'Tag must be a non-empty string.');
    process.exit(1);
  }

  // Validate tag value - ensure only a-z, A-Z, 0-9, "." and "-"
  if (!/^[a-zA-Z0-9.-]+$/.test(tag)) {
    log?.fail('🤪', 'Invalid tag. Use "latest", "preview" or string [a-z, A-Z, 0-9, ".", "-"].');
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

  // Create a client for the 'portal-config' service — inside try/catch to
  // handle token acquisition failures (e.g. expired refresh tokens).
  try {
    const client = await framework.serviceDiscovery.createClient('portal-config');
    // Subscribe to outgoing requests for logging and debugging
    client.request$.subscribe((request: FetchRequest) => {
      log?.debug('Request:', request);
      log?.info('🌎', 'Executing request to:', formatPath(request.uri));
    });

    log?.start('Tagging portal template...');
    // Send a PUT request to tag the portal template version
    const response = await client.json(`/templates/${name}/tags/${tag}`, {
      method: 'PUT',
      body: { version },
      headers: defaultHeaders,
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
        case 403: // falls through
        case 401: {
          const authMsg = formatAuthError(
            response?.status ?? 401,
            `tag portal ${name}@${version}`,
          );
          log?.fail('🔒', 'Authentication/authorization error tagging portal.');
          if (authMsg) {
            log?.error(authMsg);
          }
          process.exit(1);
          break;
        }
        default:
          log?.fail(`🤬 - ${response?.status} -`, 'Failed to tag', `Error: ${error.message}`);
          break;
      }
    }
    // Surface MSAL token acquisition failures with actionable guidance
    const tokenMsg = formatTokenAcquisitionError(error, `tag portal ${name}@${version}`);
    if (tokenMsg) {
      log?.fail('🔒', `Token acquisition failed tagging ${name}@${version}`);
      log?.error(tokenMsg);
      process.exit(1);
    }
    // Unknown error — log message only, no stack trace
    log?.fail('🤬', 'Failed to tag portal:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Export as default for compatibility with import patterns
export default tagPortal;
