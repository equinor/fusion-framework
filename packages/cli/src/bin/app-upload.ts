import chalk from 'chalk';
import AdmZip from 'adm-zip';

import type { FusionFramework } from './framework.node.js';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import { loadMetadata } from './helpers/load-bundle-metadata.js';

import type { ConsoleLogger } from './utils/index.js';

/**
 * Options for uploading an application bundle to the app service.
 *
 * This type defines the required and optional parameters for the
 * {@link uploadApplication} function, including the bundle file or AdmZip instance,
 * application key, framework instance, and logger.
 *
 * @property fileOrBundle - Path to the bundle file or an AdmZip instance.
 * @property appKey - Optional application key to override bundle metadata.
 * @property framework - The FusionFramework instance used for service discovery and requests.
 * @property log - Optional logger for outputting progress and debug information.
 *
 * @public
 */
type UploadApplicationOptions = {
  fileOrBundle: string | AdmZip;
  appKey?: string;
  framework: FusionFramework;
  log?: ConsoleLogger;
};

/**
 * Uploads an application bundle to the app service for publishing or updating an app.
 *
 * This function loads the bundle, resolves the app key (from argument or metadata),
 * reads the bundle content, and uploads it to the app service. Handles and logs errors
 * for common failure scenarios, including HTTP status codes and bundle reading issues.
 *
 * @param opt - Options for bundle file, app key, framework, and logger.
 * @returns The response from the app service, or an empty object if the response cannot be parsed.
 * @throws If bundle reading or upload fails, or if the app service returns an error status.
 * @public
 */
export const uploadApplication = async (
  opt: UploadApplicationOptions,
): Promise<{
  name: string;
  version: string;
}> => {
  const { log, framework } = opt;

  // Load the bundle from file or use the provided AdmZip instance
  const bundle =
    typeof opt.fileOrBundle === 'string' ? new AdmZip(opt.fileOrBundle) : opt.fileOrBundle;

  // Resolve the application key from argument or bundle metadata
  const { name } = opt.appKey
    ? { name: opt.appKey }
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
    // Create a client for the 'apps' service
    const appClient = await framework.serviceDiscovery.createClient('apps');
    // Subscribe to outgoing requests for logging and debugging
    appClient.request$.subscribe((request: FetchRequest) => {
      log?.info('🌎', 'Executing request to:', request.uri);
      log?.debug('Request:', request);
    });

    // Upload the bundle as a zip file to the app service
    const response = await appClient.fetch(`/bundles/apps/${name}`, {
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
      if (response.status === 409) {
        log?.fail(
          `🤬 - ${response.status} - `,
          'Version is already published, please generate a new release',
        );
        process.exit(1);
      }
      if (response.status === 410) {
        log?.fail(
          `🤬 - ${response.status} - `,
          'Application is removed from Fusion app store, please check Application Admin',
        );
        process.exit(1);
      }
      if (response.status === 404) {
        log?.fail(
          `🤬 - ${response.status} - `,
          'Application not found, please add your application in App Admin before publishing',
        );
        process.exit(1);
      }
      if (response.status === 401 || response.status === 403) {
        log?.fail(`🤬 - ${response.status} - `, 'This is not allowed for this role on this app');
        process.exit(1);
      }
      if (response.status === 500) {
        log?.fail(
          `🤬 - ${response.status} - `,
          'Internal server error, please try again later or contact support',
        );
        process.exit(1);
      }
      // Throw for any other error status
      throw new Error(
        `Failed to upload bundle. HTTP status ${response.status}, ${response.statusText}`,
      );
    }

    // Log and return the successful response
    log?.succeed('Successfully uploaded application bundle');
    log?.debug('Response:', response);
    try {
      const result = await (response.json() as Promise<{ version: string }>);
      return {
        name,
        version: result.version,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse response from app service: ${error instanceof Error ? error.message : error}`,
      );
    }
  } catch (error) {
    // Log and exit on any error during upload
    log?.fail('🙅‍♂️', 'Failed to upload application bundle');
    log?.error(error);
    process.exit(1);
  }
};

// Export as default for compatibility with import patterns
export default uploadApplication;
