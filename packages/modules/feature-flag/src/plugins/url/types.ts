import type { Path } from '@equinor/fusion-framework-module-navigation';
import type { IFeatureFlag } from '../../types';

export type AssertFeatureFlag = (options: {
  /** name of the cgi parameter */
  feature: IFeatureFlag;
  /** value of the cgi parameter */
  value: string | null;
  /** path of hit */
  path: Path;
}) => boolean;
