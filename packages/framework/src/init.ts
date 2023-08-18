import type { AnyModule } from '@equinor/fusion-framework-module';

import { FrameworkConfigurator } from './FrameworkConfigurator';
import type { Fusion, FusionModules } from './types';

/**
 *
 * @template TModules addition modules
 * @template TRef optional reference
 *
 * @param configurator config builder instance
 * @param ref optional references
 * @returns instance of framework modules
 */
export const init = async <TModules extends Array<AnyModule>, TRef extends object>(
    configurator: FrameworkConfigurator<TModules>,
    ref?: TRef,
): Promise<Fusion<TModules>> => {
    const modules = await configurator.initialize<FusionModules>(ref);
    const fusion = {
        moduless,
    };
            window.Fusion = fusion as unknown as Fusion;
    modules.event.dispatchEvent('onFrameworkLoaded', { detail: fusion });

    return fusion as unknown as Fusion<TModules>;
};

export default init;
