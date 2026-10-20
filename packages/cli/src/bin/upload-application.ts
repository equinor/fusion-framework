import chalk from 'chalk';
import AdmZip from 'adm-zip';
import { valid } from 'semver';
import { z } from 'zod';

import type { FusionFramework } from './fusion-env.js';
import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';

import { loadMetadata } from './helpers/load-metadata.js';

import {
  type ConsoleLogger,
  defaultHeaders,
  formatAuthError,
  formatTokenAcquisitionError,
} from './utils/index.js';

const uploadErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    resourceIdentifier: z.string().optional(),
  }),
});

/**
 * Logs a user-friendly error for the given HTTP status and exits the process.
 *
 * Auth failures (401/403) receive expanded, actionable guidance via
 * {@link formatAuthError}. Other status codes get a short one-liner.
 *
 * @param response - The HTTP response from the upload request.
 * @param name - The application key being uploaded.
 * @param log - Optional logger; falls back to `console.error`.
 */
function handleUploadError(response: Response, name: string, log?: ConsoleLogger): never {
  // Auth errors get the full actionable treatment
  const authMsg = formatAuthError(response.status, `upload bundle for ${name}`);
  // When an auth-related message was produced, report it and exit rather than falling through
  if (authMsg) {
    log?.fail('🔒', `Authentication/authorization error uploading ${name}`);
    log?.error(authMsg);
    process.exit(1);
  }

  let message: string;
  // Map each known status code to a short, user-facing message
  switch (response.status) {
    case 409:
      message = `${response.status} - Version is already published, please generate a new release`;
      break;
    case 410:
      message = `${response.status} - ${name} is removed from Fusion app store`;
      break;
    case 404:
      message = `${response.status} - ${name} not found, please add your application in App Admin before publishing`;
      break;
    case 500:
      message = `${response.status} - Internal server error, please try again later or contact support`;
      break;
    default:
      message = `Failed to upload bundle. HTTP status ${response.status}, ${response.statusText}`;
      break;
  }
  log?.fail('🙅‍♂️', message);
  process.exit(1);
}

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
 * @property allowExistingVersion - Reuse the exact bundle version only on a structured duplicate-version upload conflict.
 *
 * @public
 */
type UploadApplicationOptions = {
  fileOrBundle: string | AdmZip;
  appKey?: string;
  framework: FusionFramework;
  log?: ConsoleLogger;
  allowExistingVersion?: boolean;
};

/**
 * Uploads an application bundle to the app service for publishing or updating an app.
 *
 * This function loads the bundle, resolves the app key (from argument or metadata),
 * reads the bundle content, and uploads it to the app service. Handles and logs errors
 * for common failure scenarios, including HTTP status codes and bundle reading issues.
 *
 * @param opt - Options for bundle file, app key, framework, and logger.
 * @returns The uploaded app identity, or the bundle identity marked `existingVersion` on an opted-in duplicate response. Existing versions must still be tagged by the caller.
 * @throws If bundle reading or upload fails, or if the app service returns an error status.
 * @public
 */
export const uploadApplication = async (
  opt: UploadApplicationOptions,
): Promise<{
  appKey: string;
  version: string;
  existingVersion?: true;
}> => {
  const { log, framework } = opt;

  // Load the bundle from file or use the provided AdmZip instance
  const bundle =
    typeof opt.fileOrBundle === 'string' ? new AdmZip(opt.fileOrBundle) : opt.fileOrBundle;

  // Resolve the application key from argument or bundle metadata
  const { appKey } = opt.appKey
    ? { appKey: opt.appKey }
    : await loadMetadata(bundle).catch((error) => {
        log?.error('Failed to resolve manifest:', error);
        process.exit(1);
      });

  log?.info('📦', `Uploading application bundle for ${chalk.bold(appKey)}`);
  // List entry names only — full entry objects are too verbose for debug logging
  const bundleEntryNames = (await bundle.getEntries()).map((entry) => entry.entryName);
  log?.debug('Bundle contents:', bundleEntryNames);

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
    const response = await appClient.fetch(`/bundles/apps/${appKey}`, {
      method: 'POST',
      body: new Blob([content as Uint8Array<ArrayBuffer>], {
        type: 'application/zip',
      }),
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/zip',
      },
    });

    // Handle non-OK responses with detailed error logging
    if (!response.ok) {
      let uploadError: z.infer<typeof uploadErrorSchema> | undefined;
      try {
        const parsed = uploadErrorSchema.safeParse(await response.json());
        // Recovery requires a recognized service error shape; malformed payloads fail closed.
        if (parsed.success) {
          uploadError = parsed.data;
          const { error } = uploadError;
          log?.debug('Error:', error);
          log?.warn(
            chalk.red(`🤯 error: ${error.code}\n`),
            chalk.yellowBright(error.message),
            '\n',
          );
        } else {
          log?.debug('Unrecognized upload error response:', parsed.error);
        }
      } catch (error) {
        log?.debug('Failed to parse upload error response:', error);
      }

      // Recovery is scoped to the upload endpoint's version resource, never a generic 409.
      if (
        opt.allowExistingVersion === true &&
        response.status === 409 &&
        uploadError?.error.code === 'ConflictError' &&
        uploadError.error.resourceIdentifier === 'version'
      ) {
        const manifestEntry = bundle.getEntry('app-manifest.json');
        // The manifest is the authoritative version source for this uploaded bundle.
        if (!manifestEntry) {
          throw new Error('Cannot recover existing version: app-manifest.json is missing');
        }
        const manifest = z
          .object({ version: z.string().refine((value) => valid(value) !== null) })
          .parse(JSON.parse(manifestEntry.getData().toString()));
        const version = manifest.version.toLowerCase();
        // Do not infer an application identity when bundle metadata is incomplete.
        if (typeof appKey !== 'string' || !appKey.trim()) {
          throw new Error('Cannot recover existing version: application key is missing');
        }
        // Only the exact duplicate-version response is safe to reinterpret as success.
        if (uploadError.error.message === `An app build with version ${version} already exists`) {
          return { appKey, version, existingVersion: true };
        }
      }

      // Handle specific HTTP status codes — logs and exits, never throws
      handleUploadError(response, appKey, log);
    }

    // Log and return the successful response
    log?.succeed('Successfully uploaded application bundle');
    log?.debug('Response:', response);
    try {
      const result = await (response.json() as Promise<{ version: string }>);
      return {
        appKey,
        version: result.version,
      };
    } catch (error) {
      log?.fail(
        '🙅‍♂️',
        `Failed to parse response from app service: ${error instanceof Error ? error.message : error}`,
      );
      process.exit(1);
    }
  } catch (error) {
    // Surface MSAL token acquisition failures with actionable guidance
    const tokenMsg = formatTokenAcquisitionError(error, `upload bundle for ${appKey}`);
    // When a token-related message was produced, report it and exit rather than falling through
    if (tokenMsg) {
      log?.fail('🔒', `Token acquisition failed uploading ${appKey}`);
      log?.error(tokenMsg);
      process.exit(1);
    }
    // Unexpected / network-level errors
    log?.fail('🙅‍♂️', 'Failed to upload application bundle');
    log?.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Export as default for compatibility with import patterns
export default uploadApplication;
