import type { IFeatureFlag } from '../../types';

export type Path = Pick<Location, 'pathname' | 'hash' | 'search'>;

export type AssertFeatureFlag = (options: {
    /** name of the cgi parameter */
    feature: IFeatureFlag;
    /** value of the cgi parameter */
    value: string | null;
    /** path of hit */
    path: Path;
}) => boolean;
