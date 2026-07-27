import {
  type EventModule,
  type IEventModuleProvider,
  eventModuleKey,
} from '@equinor/fusion-framework-module-event';
import { useModule } from '@equinor/fusion-framework-react-module';
import { createContext, useContext } from 'react';

// No default provider is available until a real module resolves; the context
// consumer always calls useEventProvider(), which throws if still undefined.
const defaultEventModuleProvider = undefined as unknown as IEventModuleProvider;
export const context = createContext<IEventModuleProvider>(defaultEventModuleProvider);

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
