import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { createContext } from 'react';

export const eventContext = createContext<IEventModuleProvider>(
    undefined as unknown as IEventModuleProvider
);

export const { Consumer: EventConsumer, Provider: EventProvider } = eventContext;
