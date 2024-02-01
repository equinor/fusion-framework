import { type AppConfigurator, type IAppConfigurator } from '@equinor/fusion-framework-app';

import {
    enableFeatureFlagging,
    type FeatureFlagBuilderCallback,
    type IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';

import {
    createLocalStoragePlugin,
    createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';

/**
 * Enables the specified feature flags.
 *
 * @param configurator - The AppConfigurator instance.
 * @param flags - An array of feature flags to enable.
 */
export interface enableFeatureFlag {
    (
        configurator: IAppConfigurator,
        flags: Array<IFeatureFlag<unknown> & { allowUrl?: boolean | undefined }>,
    ): void;
}

/**
 * Enables a feature flag by invoking the provided configurator and callback.
 *
 * @param configurator - The AppConfigurator responsible for configuring the feature flag.
 * @param cb - The FeatureFlagBuilderCallback to be executed for the feature flag.
 *
 * @remarks
 * Advance use __ONLY__
 */
export interface enableFeatureFlag {
    (configurator: IAppConfigurator, cb: FeatureFlagBuilderCallback): void;
}

/**
 * Enables feature flagging based on the provided configurator and flags callback.
 * @param configurator The AppConfigurator instance.
 * @param flags_cb Optional flags callback that can be an array of feature flags or a callback function.
 */
export function enableFeatureFlag(
    configurator: IAppConfigurator,
    flags_cb:
        | Array<IFeatureFlag<unknown> & { allowUrl?: boolean | undefined }>
        | FeatureFlagBuilderCallback,
): void {
    switch (typeof flags_cb) {
        case 'function': {
            enableFeatureFlagging(configurator, flags_cb);
            break;
        }
        case 'object': {
            const urlFlags: IFeatureFlag[] = [];
            const localFlags = (flags_cb ?? []).map((flag) => {
                const { allowUrl, ...localFlag } = flag;
                if (allowUrl) {
                    urlFlags.push(flag);
                }
                return localFlag;
            });
            enableFeatureFlagging(configurator, async (builder) => {
                builder.addPlugin(
                    createLocalStoragePlugin(localFlags, {
                        name: (configurator as AppConfigurator).env?.manifest.key,
                    }),
                );
                builder.addPlugin(createUrlPlugin(urlFlags));
            });
            break;
        }
    }
}
