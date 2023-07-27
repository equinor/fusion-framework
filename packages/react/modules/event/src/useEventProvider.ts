import { useContext } from 'react';

import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import { eventContext } from './eventContext';
import { useModulesEventProvider } from 'useModulesEventProvider';

/**
 * Hook for using {@link IEventModuleProvider} from context
 * If no context provider is provided this hook will try to use the modules event provider
 */
export const useEventProvider = (): IEventModuleProvider => {
    const provider = useContext(eventContext);
    const moduleProvider = useModulesEventProvider();
    if (provider) {
        return provider;
    } else if (moduleProvider) {
        return moduleProvider;
    }
    throw Error('no event provider in context, nor configured within module scope');
};
