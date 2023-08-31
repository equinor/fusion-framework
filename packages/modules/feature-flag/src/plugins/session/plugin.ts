import type { SessionFeatureFlagPlugin } from './types';
import { v5 as generateUniqueKey } from 'uuid';

import { name as namespace } from '../../module';
import { FeatureFlag, FeatureFlagObj } from '../../FeatureFlag';

export const plugin = (args: { name: string }): SessionFeatureFlagPlugin => {
    const { name } = args;
    const uuid = generateUniqueKey(name, namespace);
    const cacheKey = `${namespace.toUpperCase}_${uuid}`;
    return {
        initialize: ({ provider }) =>
            provider.features$.subscribe((values) =>
                sessionStorage.setItem(cacheKey, JSON.stringify(values)),
            ),
        initial: async () => {
            const record = sessionStorage.getItem(cacheKey);
            if (record) {
                try {
                    const rawValues = JSON.parse(record) as Array<FeatureFlagObj>;
                    return rawValues.map(FeatureFlag.Parse);
                } catch (err) {
                    console.warn(`failed to restore session value from ${cacheKey}`, err);
                }
            }
            return [];
        },
    };
};
