import { Observable, Observer, Subject, Subscription } from 'rxjs';

import { IEventModuleConfigurator } from './configurator';
import { FrameworkEventDispatcher, FrameworkEventHandler } from './dispatcher';

import {
    IFrameworkEvent,
    FrameworkEvent,
    FrameworkEventInit,
    FrameworkEventInitType,
    FrameworkEventMap,
} from './event';

export interface IEventModuleProvider {
    /** subscribe to a known mapped event @see {@link FrameworkEventMap} */
    addEventListener<TKey extends keyof FrameworkEventMap>(
        type: TKey,
        handler: FrameworkEventHandler<FrameworkEventMap[TKey]>
    ): VoidFunction;

    /** subscribe to generic type */
    addEventListener<TType extends FrameworkEvent = FrameworkEvent>(
        type: string,
        handler: FrameworkEventHandler<TType>
    ): VoidFunction;

    /** dispatch a known mapped event type @see {@link FrameworkEventMap} */
    dispatchEvent<TType extends keyof FrameworkEventMap>(
        type: TType,
        args: FrameworkEventInitType<FrameworkEventMap[TType]>
    ): Promise<FrameworkEvent>;

    /** dispatch generic event */
    dispatchEvent<TDetail, TSource>(
        type: string,
        args: FrameworkEventInit<TDetail, TSource>
    ): Promise<FrameworkEvent>;

    /** dispatch event instance */
    dispatchEvent<TType extends IFrameworkEvent = FrameworkEvent>(
        event: TType
    ): Promise<FrameworkEvent>;

    /**
     * subscribe to events
     * __note__: does not allow side effects
     */
    subscribe(observer?: Partial<Observer<IFrameworkEvent>>): Subscription;

    /**
     * subscribe to events
     * __note__: does not allow side effects
     */
    subscribe(next: (value: IFrameworkEvent) => void): Subscription;

    dispose: VoidFunction;
}

export class EventModuleProvider
    extends Observable<IFrameworkEvent>
    implements IEventModuleProvider
{
    private __listeners: Array<{
        type: string;
        handler: FrameworkEventHandler;
    }> = [];

    private __event$ = new Subject<IFrameworkEvent>();

    private __dispatcher: FrameworkEventDispatcher<FrameworkEvent>;

    get closed() {
        return this.__event$.closed;
    }

    constructor(config: IEventModuleConfigurator) {
        super((subscriber) => {
            this.__event$.subscribe(subscriber);
        });
        this.__dispatcher = new FrameworkEventDispatcher({
            onDispatch: config.onDispatch,
            onBubble: config.onBubble,
        });
    }

    public addEventListener(type: string, handler: FrameworkEventHandler): VoidFunction {
        if (this.closed) {
            throw Error('Cannot listen to events when provider is closed!');
        }
        const listener = { type, handler };
        this.__listeners.push(listener);
        return () => {
            const index = this.__listeners.indexOf(listener);
            0 <= index && this.__listeners.splice(index, 1);
        };
    }

    public async dispatchEvent(
        typeOrEvent: string | FrameworkEvent,
        init?: FrameworkEventInit
    ): Promise<FrameworkEvent> {
        if (typeof typeOrEvent === 'string') {
            if (!init) {
                throw Error('invalid arguments, missing [FrameworkEventInit]');
            }
            return this._dispatchEvent(new FrameworkEvent(typeOrEvent, init));
        } else {
            return this._dispatchEvent(typeOrEvent as FrameworkEvent);
        }
    }

    protected async _dispatchEvent(event: FrameworkEvent): Promise<FrameworkEvent> {
        if (this.closed) {
            throw Error('Cannot dispatch events when provider is closed!');
        }

        this.__event$.next(event);

        try {
            const listeners = this.__listeners
                .filter((listener) => listener.type === event.type)
                .map(({ handler }) => handler);
            await this.__dispatcher.dispatch(event, listeners);
        } catch (err) {
            throw err as Error;
        }
        return event;
    }

    public dispose() {
        this.__listeners = [];
        this.__event$.complete();
    }
}
