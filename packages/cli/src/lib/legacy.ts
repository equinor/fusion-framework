import chalk from 'chalk';
import { defineAppConfig as _defineConfig } from './app/app-config.js';
import { defineAppManifest as _defineManifest } from './app/app-manifest.js';

/**
 * @deprecated
 * Will be removed in the next major version.
 * Please use `defineAppConfig` from `@equinor/fusion-framework-cli/app` instead.
 *
 * Transitional wrapper for legacy defineAppConfig. This function exists only to prevent immediate breaking changes
 * and should be removed as soon as possible. Consumers should migrate to the new API without delay.
 *
 * @param args - Arguments passed to the new defineAppConfig function.
 */
export const defineAppConfig = (...args: Parameters<typeof _defineConfig>) => {
  // Emit a strong warning to alert consumers that this usage is deprecated and must be fixed ASAP
  console.warn(
    chalk.bgRed.white.bold('[DEPRECATION]'),
    chalk.redBright.bold(
      '[@equinor/fusion-framework-cli] `defineAppConfig` is deprecated and will be removed in the next major version!\n' +
        'Please update your code to use `defineAppConfig` from `@equinor/fusion-framework-cli/app` as soon as possible.',
    ),
  );
  // Forward the call to the new implementation
  _defineConfig(...args);
};

/**
 * @deprecated
 * Will be removed in the next major version.
 * Please use `defineAppManifest` from `@equinor/fusion-framework-cli/app` instead.
 *
 * Transitional wrapper for legacy defineAppManifest. This function exists only to prevent immediate breaking changes
 * and should be removed as soon as possible. Consumers should migrate to the new API without delay.
 *
 * @param args - Arguments passed to the new defineAppManifest function.
 */
export const defineAppManifest = (...args: Parameters<typeof _defineManifest>) => {
  // Emit a strong warning to alert consumers that this usage is deprecated and must be fixed ASAP
  console.warn(
    chalk.bgRed.white.bold('[DEPRECATION]'),
    chalk.redBright.bold(
      '[@equinor/fusion-framework-cli] `defineAppManifest` is deprecated and will be removed in the next major version!\n' +
        'Please update your code to use `defineAppManifest` from `@equinor/fusion-framework-cli/app` as soon as possible.',
    ),
  );
  // Forward the call to the new implementation
  _defineManifest(...args);
};
