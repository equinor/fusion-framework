import AdmZip from 'adm-zip';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import type { FusionFramework } from './framework.node.js';
import type { ConsoleLogger } from './utils/ConsoleLogger.js';
import { chalk } from './utils/index.js';
import { loadMetadata } from './helpers/load-bundle-metadata.js';

/**
 * Options for uploading a portal bundle to the portal service.
 *
 * This type defines the required and optional parameters for the
 * {@link uploadPortalBundle} function, including the bundle file or AdmZip instance,
 * portal name, framework instance, and logger.
 *
 * @property fileOrBundle - Path to the bundle file or an AdmZip instance.
 * @property name - Optional portal name to override bundle metadata.
 * @property framework - The FusionFramework instance used for service discovery and requests.
 * @property log - Optional logger for outputting progress and debug information.
 *
 * @public
 */
export type UploadPortalOptions = {
  fileOrBundle: string | AdmZip;
  name?: string;
  framework: FusionFramework;
  log?: ConsoleLogger;
};

/**
 * Handles HTTP response errors during the upload process by throwing descriptive errors
 * based on the response status code.
 *
 * @param response - The HTTP response object from the upload request.
 * @param name - The name of the resource being uploaded.
 * @throws {Error} Throws an error with a specific message depending on the response status:
 * - 409: Version already published.
 * - 410: Resource removed.
 * - 404: Resource not found.
 * - 401/403: Operation not allowed for the user's role.
 * - 500: Internal server error.
 * - Any other status: Generic upload failure message.
 */
function processUploadError(response: Response, name: string) {
  switch (response.status) {
    case 409:
      throw new Error(
        `${response.status} - Version is already published, please generate a new release`,
      );
    case 410:
      throw new Error(`${response.status} - ${name} is removed from Fusion`);
    case 404:
      throw new Error(`${response.status} - ${name} not found`);
    case 401:
    case 403:
      throw new Error(`${response.status} - This is not allowed for your role on ${name}`);
    case 500:
      throw new Error(
        `${response.status} - Internal server error, please try again later or contact support`,
      );
    default:
      throw new Error(
        `Failed to upload bundle. HTTP status ${response.status}, ${response.statusText}`,
      );
  }
}

/**
 * Uploads a portal bundle to the portal service for publishing or updating a portal template.
 *
 * This function loads the bundle, resolves the portal name (from argument or metadata),
 * reads the bundle content, and uploads it to the portal service. Handles and logs errors
 * for common failure scenarios, including HTTP status codes and bundle reading issues.
 *
 * @param opt - Options for bundle file, portal name, framework, and logger.
 * @returns A promise that resolves when the upload is complete.
 * @throws If bundle reading or upload fails, or if the portal service returns an error status.
 * @public
 */
export const uploadPortalBundle = async (opt: UploadPortalOptions) => {
  const { log, framework } = opt;

  // Load the bundle from file or use the provided AdmZip instance
  const bundle =
    typeof opt.fileOrBundle === 'string' ? new AdmZip(opt.fileOrBundle) : opt.fileOrBundle;

  // Resolve the portal name from argument or bundle metadata
  const { name } = opt.name
    ? { name: opt.name }
    : await loadMetadata(bundle).catch((error) => {
        log?.error('Failed to resolve manifest:', error);
        process.exit(1);
      });

  // Read the bundle content as a buffer
  const content = await bundle.toBufferPromise().catch((error) => {
    log?.error('Failed to read bundle content:', error);
    process.exit(1);
  });

  try {
    // Create a client for the 'portal-config' service
    const appClient = await framework.serviceDiscovery.createClient('portal-config');
    // Subscribe to outgoing requests for logging and debugging
    appClient.request$.subscribe((request: FetchRequest) => {
      log?.info('🌎', 'Executing request to:', request.uri);
      log?.debug('Request:', request);
    });

    // Upload the bundle as a zip file to the portal service
    const response = await appClient.fetch(`/bundles/templates/${name}`, {
      method: 'POST',
      body: new Blob([content as Uint8Array<ArrayBuffer>], {
        type: 'application/zip',
      }),
      headers: {
        'Content-Type': 'application/zip',
      },
    });

    // Handle non-OK responses with detailed error logging
    if (!response.ok) {
      try {
        const { error } = await response.json();
        log?.debug('Error:', error);
        if (error.message) {
          log?.warn(
            chalk.red(`🤯 error: ${error.code}\n`),
            chalk.yellowBright(error.message),
            '\n',
          );
        }
      } catch (e) {
        log?.debug('Error:', response.statusText);
      }

      // Handle specific HTTP status codes for user-friendly error messages
      processUploadError(response, name);
    }

    // Log and return the successful response
    log?.succeed('Successfully uploaded portal bundle');
    log?.debug('Response:', response);
  } catch (error) {
    // Log and exit on any error during upload
    log?.fail('🙅‍♂️', 'Failed to upload portal bundle');
    log?.error(error);
    process.exit(1);
  }
};

// Export as default for compatibility with import patterns
export default uploadPortalBundle;
