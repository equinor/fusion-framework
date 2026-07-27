import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { createContext } from 'react';

// No default provider is available until a real module resolves; consumers
// must read the context via a hook that resolves the actual module provider.
const defaultEventModuleProvider = undefined as unknown as IEventModuleProvider;
export const eventContext = createContext<IEventModuleProvider>(defaultEventModuleProvider);
