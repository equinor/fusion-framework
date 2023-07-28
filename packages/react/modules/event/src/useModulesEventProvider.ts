import { useModule } from '@equinor/fusion-framework-react-module';

import {
    EventModule,
    IEventModuleProvider,
    eventModuleKey,
} from '@equinor/fusion-framework-module-event';

/**
 * Hook for using the event module from the closes ModuleProvider
 * @see {@link useModule}
 */
export const useModulesEventProvider = (): IEventModuleProvider | undefined =>
    useModule<EventModule>(eventModuleKey);
