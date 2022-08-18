import { FrameworkEvent } from 'event';

export interface IEventModuleConfigurator {
    /** Callback when events are dispatched (before other listeners) */
    onDispatch?: (event: FrameworkEvent) => Promise<void> | void;

    /**
     * Callback when listeners of providers are notified
     *
     *__NOTE__: if preventDefault or stopPropagation is called, this callback will not trigger
     */
    onBubble?: (event: FrameworkEvent) => Promise<void> | void;
}
