import { IFeatureFlag } from '../FeatureFlag';

export const normalizeFlags = <T extends IFeatureFlag = IFeatureFlag>(
    flags: Array<T>,
): Record<string, T> => flags.reduce((acc, flag) => Object.assign(acc, { [flag.key]: flag }), {});

export default normalizeFlags;
