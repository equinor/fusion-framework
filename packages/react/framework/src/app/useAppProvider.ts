import { FusionModulesInstance } from '@equinor/fusion-framework';
import { AppModule } from '@equinor/fusion-framework-module-app';

import { useFramework } from '../useFramework';

export const useAppProvider = (): FusionModulesInstance<[AppModule]>['app'] => {
    const provider = useFramework<[AppModule]>().modules.app;
    if (!provider) {
        throw Error('Current framework does not have AppModule configured');
    }

    return provider;
};

export default useAppProvider;