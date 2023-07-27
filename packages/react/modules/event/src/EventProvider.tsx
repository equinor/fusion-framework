import {
    EventModule,
    IEventModuleProvider,
    eventModuleKey,
} from '@equinor/fusion-framework-module-event';
import { useModule } from '@equinor/fusion-framework-react-module';
import { createContext, useContext } from 'react';

export const context = createContext<IEventModuleProvider>(
    undefined as unknown as IEventModuleProvider
);

const useModulesEventProvider = (): IEventModuleProvider | undefined =>
    useModule<EventModule>(eventModuleKey);

export const { Consumer: EventConsumer, Provider: EventProvider } = context;

export const useEventProvider = (): IEventModuleProvider => {
    const provider = useContext(context);
    const moduleProvider = useModulesEventProvider();
    if (provider) {
        return provider;
    } else if (moduleProvider) {
        return moduleProvider;
    }
    throw Error('no event provider in context, nor configured within module scope');
};

export default EventProvider;
