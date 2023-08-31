import type { FeatureFlagPluginConfigCallback } from '../../types';
import { plugin } from './plugin';
import { SessionFeatureFlagPlugin } from './types';

/**
 * in the future this module should get storage module from init
 */

export const enablePlugin =
    (name: string): FeatureFlagPluginConfigCallback<SessionFeatureFlagPlugin> =>
    async () =>
        plugin({ name });

export default enablePlugin;
