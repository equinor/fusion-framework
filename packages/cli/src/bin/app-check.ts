import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from './framework.node.js';

import type { ConsoleLogger } from './utils/index.js';

import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppManifest } from './helpers/resolve-app-manifest.js';

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
};

/**
 * Checks if the application is registered in the app store.
 *
 * Resolves the app package and manifest, initializes the Fusion Framework, and queries the app store.
 *
 * @param options - Options for environment, authentication, and logging.
 * @returns A promise that resolves when the check is complete.
 * @public
 */
export const checkApp = async (options: AppCheckOptions) => {
  const { log } = options;

  // Resolve the application's package.json for metadata and dependencies
  const pkg = await resolveProjectPackage(log);

  // Resolve the application manifest for the build/production mode
  // Manifest contains the appKey and other app metadata
  const manifest = await resolveAppManifest({ command: 'build', mode: 'production' }, pkg, {
    log,
  });

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
  appClient.request$.subscribe((request) => {
    log?.info('🌎', 'Executing request to:', request.uri);
    log?.debug('Request:', request);
  });

  try {
    // Start the check for app registration in the app store
    log?.start(`Checking if ${manifest.appKey} is registered in app store`);
    // Send a HEAD request to check if the app is registered
    const response = await appClient.fetch(`/apps/${manifest.appKey}`, {
      method: 'HEAD',
    });
    // If the response is OK, the app is registered
    if (response.ok) {
      return log?.succeed('😃', `Application ${manifest.appKey} is registered in app store`);
    }
    // If the response is 404, the app is not registered
    if (response.status === 404) {
      return log?.fail('😞', `Application ${manifest.appKey} is not registered in app store`);
    }
    // Any other status is unexpected and should be handled as an error
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (err) {
    // Log and handle errors during the registration check
    log?.fail('🙅‍♂️', 'Error checking application registration');
    log?.error('Error checking application registration:', err);
  }
};

// Export as default for compatibility with import patterns
export default checkApp;
