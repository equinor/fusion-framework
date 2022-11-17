import type { AnyModule } from '@equinor/fusion-framework-module';

import { FusionConfigurator } from './configurator';
import type { Fusion, FusionModules } from './types';

export const init = async <TModules extends Array<AnyModule>, TRef extends object>(
    configurator: FusionConfigurator<TModules>,
    ref?: TRef
): Promise<Fusion<TModules>> => {
    const modules = await configurator.initialize<FusionModules>(ref);
    const fusion = {
        modules,
    };
    window.Fusion = fusion as unknown as Fusion;
    modules.event.dispatchEvent('onFrameworkLoaded', { detail: fusion });

    return fusion as unknown as Fusion<TModules>;
};

export default init;
