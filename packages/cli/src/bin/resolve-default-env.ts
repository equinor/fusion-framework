import isContinuousIntegration from 'is-ci';

import { FusionEnv } from './fusion-env.js';

/**
 * Resolves the default environment based on CI status and dev allowance.
 *
 * @param allowDev - If true, allows development environment when not in CI.
 * @returns The resolved Fusion environment.
 */
export const resolveDefaultEnv = (allowDev: boolean) => {
  // If development is allowed and not running in CI, use development environment
  if (allowDev && !isContinuousIntegration) {
    return FusionEnv.Development;
  }
  // Otherwise, default to CI environment
  return FusionEnv.ContinuesIntegration;
};
