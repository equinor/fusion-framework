import { type IFeatureFlag } from '../../FeatureFlag';

export type Path = Pick<Location, 'pathname' | 'hash' | 'search'>;

export type CgiAssertionOptions = {
    /** name of the cgi parameter */
    feature: IFeatureFlag;
    /** value of the cgi parameter */
    value: string | null;
    /** path of hit */
    path: Path;
};

export type AssertFeatureFlag = (options: CgiAssertionOptions) => boolean;

export type { FeatureFlagPlugin as CgiFeatureFlagPlugin } from '../../types';
