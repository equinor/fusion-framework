import type { AssertFeatureFlag } from './types';

/**
 * Asserts if a feature flag is enabled feature flag.
 *
 * @param options - The options for asserting the feature flag.
 * @returns `true` if the feature flag is enabled, `false` otherwise.
 */
export const assertFeatureFlag: AssertFeatureFlag = (options) => {
  // "0" and "false" are the only values treated as an explicit disable
  if (options.value === '0' || options.value === 'false') {
    return false;
  }
  return true;
};
