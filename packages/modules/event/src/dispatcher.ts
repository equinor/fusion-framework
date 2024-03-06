import { IFrameworkEvent } from './event';

export type FrameworkEventHandler<TType extends IFrameworkEvent = IFrameworkEvent> = (
    event: TType,
) => Promise<void> | void;

/**
 * Interface for dispatching framework events.
 * @template TEvent - The type of event to dispatch.
 */
export interface IFrameworkDispatcher<TEvent extends IFrameworkEvent> {
    /**
     * Dispatches the given event to the given listeners.
     * @param event - The event to dispatch.
     * @param listeners - The listeners to dispatch the event to.
     */
    dispatch(event: TEvent, listeners: Array<FrameworkEventHandler<TEvent>>): Promise<void>;
}

/**
 * Interface for dispatching framework events.
 *
 *
 */
interface FrameworkDispatchEvent<TEvent extends IFrameworkEvent> extends IFrameworkEvent {
    dispatcher: IFrameworkDispatcher<TEvent>;
}

export type FrameworkEventDispatcherCtorArgs<TEvent extends IFrameworkEvent> = {
    onDispatch?: FrameworkEventHandler<TEvent>;
    onBubble?: FrameworkEventHandler<TEvent>;
};

export class FrameworkEventDispatcher<TEvent extends IFrameworkEvent>
    implements IFrameworkDispatcher<TEvent>
{
    private __onDispatch?: FrameworkEventHandler<TEvent>;
    private __onBubble?: FrameworkEventHandler<TEvent>;

    constructor({ onDispatch, onBubble }: FrameworkEventDispatcherCtorArgs<TEvent>) {
        this.__onDispatch = onDispatch;
        this.__onBubble = onBubble;
    }

    async dispatch(event: TEvent, listeners: FrameworkEventHandler<TEvent>[]): Promise<void> {
        try {
            await this.__onDispatch?.(event);
        } catch (err) {
            throw err as Error;
        }

        const dispatchEvent = event as unknown as FrameworkDispatchEvent<TEvent>;
        if (!dispatchEvent.dispatcher) {
            dispatchEvent.dispatcher = this;
        } else if (dispatchEvent.dispatcher === this) {
            throw Error('loop detected');
        }

        for (const dispatch of listeners) {
            if (!event.cancelable) {
                dispatch(event);
            } else if (!event.canceled) {
                await Promise.resolve(dispatch(event));
            }
        }

        if (event.bubbles) {
            try {
                await this.__onBubble?.(event);
            } catch (err) {
                throw err as Error;
            }
        }
    }
}
