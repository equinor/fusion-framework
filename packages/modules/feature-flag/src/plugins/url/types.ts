import type { Path } from '@equinor/fusion-framework-module-navigation';
import type { IFeatureFlag } from '../../types';

/**
 * Assertion function used by the URL plugin to determine whether a feature
 * flag should be considered enabled based on its query-parameter value.
 *
 * @param options - Contextual information about the flag, its value, and the current path.
 * @returns `true` if the feature flag should be enabled.
 */
export type AssertFeatureFlag = (options: {
  /** The feature flag being evaluated. */
  feature: IFeatureFlag;
  /** Raw query-parameter value (may be `null` when the key is present without a value). */
  value: string | null;
  /** Current navigation path at the time of evaluation. */
  path: Path;
}) => boolean;
