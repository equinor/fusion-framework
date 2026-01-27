import type { FetchRequest } from '@equinor/fusion-framework-module-http/client';
import AdmZip from 'adm-zip';

import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from './framework.node.js';

import { defaultHeaders, type ConsoleLogger } from './utils/index.js';

import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppManifest } from './helpers/resolve-app-manifest.js';
import { resolveAppFromArtifact } from './helpers/resolve-app-from-artifact.js';

/**
 * Options for checking application registration in the app store.
 * @public
 */
type AppCheckOptions = {
  /**
   * The environment configuration for the Fusion Framework.
   */
  environment: FusionEnv;
  /**
   * Authentication settings for the Fusion Framework.
   */
  auth: FusionFrameworkSettings['auth'];
  /**
   * Optional logger for outputting progress and debug information.
   */
  log?: ConsoleLogger;
  /**
   * Optional path to the app bundle for artifact-based validation.
   * When provided, the function will extract app metadata from the bundle
   * instead of using the local package.json file.
   */
  bundle?: string;
};

/**
 * Checks if the application is registered in the app store.
 *
 * This function can operate in two modes:
 * 1. Traditional mode: Resolves the app package and manifest from local files
 * 2. Artifact mode: Extracts app metadata from a provided bundle file
 *
 * The artifact mode enables publishing applications from any directory in CI/CD
 * pipelines without requiring the source code directory structure.
 *
 * @param options - Options for environment, authentication, logging, and optional bundle path.
 * @returns A promise that resolves to true if the app is registered, false otherwise.
 * @public
 */
export const checkApp = async (options: AppCheckOptions): Promise<boolean> => {
  const { log, bundle } = options;

  let appKey: string;

  if (bundle) {
    // Artifact-based validation: extract app metadata from bundle
    try {
      log?.info('🗜️', 'Using artifact-based validation from bundle:', bundle);
      const bundleZip = new AdmZip(bundle);
      const appInfo = await resolveAppFromArtifact(bundleZip);
      appKey = appInfo.appKey;
      log?.info('📦', `Resolved app key "${appKey}" from bundle artifact`);
    } catch (error) {
      log?.fail(
        '🚫',
        'Failed to resolve app information from bundle:',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  } else {
    // Traditional validation: use local package.json and manifest files
    log?.info('📁', 'Using traditional validation from local project files');

    // Resolve the application's package.json for metadata and dependencies
    const pkg = await resolveProjectPackage(log);

    // Resolve the application manifest for the build/production mode
    // Manifest contains the appKey and other app metadata
    const manifest = await resolveAppManifest({ command: 'build', mode: 'production' }, pkg, {
      log,
    });

    appKey = manifest.appKey;
  }

  log?.start('Initializing Fusion Framework...');
  // Initialize the Fusion Framework with the provided environment and authentication
  // If the auth object contains a token, use it; otherwise, use the provided auth config
  const framework = await initializeFramework({
    env: options.environment,
    auth: 'token' in options.auth ? { token: options.auth.token } : options.auth,
  });
  log?.succeed('Initialized Fusion Framework');

  // Create a client for the 'apps' service using service discovery
  const appClient = await framework.serviceDiscovery.createClient('apps');

  // Subscribe to outgoing requests for logging and debugging
  appClient.request$.subscribe((request: FetchRequest) => {
    log?.info('🌎', 'Executing request to:', request.uri);
    log?.debug('Request:', request);
  });

  try {
    // Start the check for app registration in the app store
    log?.info('Checking if', appKey, 'is registered in app store');
    // Send a HEAD request to check if the app is registered
    const response = await appClient.fetch(`/apps/${appKey}`, {
      method: 'HEAD',
      headers: defaultHeaders,
    });
    // If the response is OK, the app is registered
    if (response.ok) {
      log?.succeed('😃', `Application ${appKey} is registered in app store`);
      return true;
    }
    // If the response is 404, the app is not registered
    if (response.status === 404) {
      log?.fail('😞', `Application ${appKey} is not registered in app store`);
      return false;
    }
    // If the response is 410 the app is deleted
    if (response.status === 410) {
      log?.fail('😞', `Application ${appKey} is deleted from app store`);
      return false;
    }
    // Any other status is unexpected and should be handled as an error
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (err) {
    // Log and handle errors during the registration check
    log?.fail('🙅‍♂️', 'Error checking application registration');
    log?.error('Error checking application registration:', err);
    return false;
  }
};

// Export as default for compatibility with import patterns
export default checkApp;
