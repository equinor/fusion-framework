import { type Observable, Subject } from 'rxjs';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import { version } from './version.js';

import type { IEventModuleConfigurator } from './configurator';
import { FrameworkEventDispatcher, type FrameworkEventHandler } from './dispatcher';

import {
  type IFrameworkEvent,
  FrameworkEvent,
  type FrameworkEventInit,
  type FrameworkEventInitType,
  type FrameworkEventMap,
} from './event';

/**
 * Public contract for the event module provider.
 *
 * Provides methods to add event listeners, dispatch events (both typed and
 * untyped), and an observable stream of all dispatched events. Dispose the
 * provider to complete the stream and remove all listeners.
 */
export interface IEventModuleProvider {
  /** Observable stream of all dispatched events, useful for logging or analysis.
   * Subscribers receive read-only copies and cannot call `preventDefault`.
   */
  readonly event$: Observable<IFrameworkEvent>;

  /**
   * Registers a listener for a known event type from {@link FrameworkEventMap}.
   *
   * @template TKey - A registered event name.
   * @param type - The event name to listen for.
   * @param handler - Callback invoked when the event is dispatched.
   * @returns A teardown function that removes the listener.
   */
  addEventListener<TKey extends keyof FrameworkEventMap>(
    type: TKey,
    handler: FrameworkEventHandler<FrameworkEventMap[TKey]>,
  ): VoidFunction;

  /**
   * Registers a listener for an arbitrary (unregistered) event name.
   *
   * @template TType - The expected event type.
   * @param type - The event name string.
   * @param handler - Callback invoked when the event is dispatched.
   * @returns A teardown function that removes the listener.
   */
  addEventListener<TType extends FrameworkEvent = FrameworkEvent>(
    type: string,
    handler: FrameworkEventHandler<TType>,
  ): VoidFunction;

  /**
   * Dispatches a known event type from {@link FrameworkEventMap}.
   *
   * @template TType - A registered event name.
   * @param type - The event name to dispatch.
   * @param args - Initialization options for the event.
   * @returns The dispatched event after all listeners have run.
   */
  dispatchEvent<TType extends keyof FrameworkEventMap>(
    type: TType,
    args: FrameworkEventInitType<FrameworkEventMap[TType]>,
  ): Promise<FrameworkEvent>;

  /**
   * Dispatches an event with an arbitrary name and typed payload.
   *
   * @template TDetail - Type of the event detail payload.
   * @template TSource - Type of the event source.
   * @param type - The event name string.
   * @param args - Initialization options for the event.
   * @returns The dispatched event after all listeners have run.
   */
  dispatchEvent<TDetail, TSource>(
    type: string,
    args: FrameworkEventInit<TDetail, TSource>,
  ): Promise<FrameworkEvent>;

  /**
   * Dispatches a pre-constructed event instance.
   *
   * @template TType - The event type.
   * @param event - The event instance to dispatch.
   * @returns The same event after all listeners have run.
   */
  dispatchEvent<TType extends IFrameworkEvent = FrameworkEvent>(
    event: TType,
  ): Promise<FrameworkEvent>;

  /** Disposes the provider, completing `event$` and removing all listeners. */
  dispose: VoidFunction;
}

/**
 * Default implementation of the event module provider.
 *
 * Manages event listeners, the internal {@link FrameworkEventDispatcher}, and
 * an RxJS `Subject` that streams all dispatched events as an observable.
 *
 * Created automatically by the event module during framework initialization.
 * Dispose the provider (or the framework) to clean up listeners and complete
 * the observable stream.
 */
export class EventModuleProvider
  extends BaseModuleProvider<IEventModuleConfigurator>
  implements IEventModuleProvider
{
  private __listeners: Array<{
    type: string;
    handler: FrameworkEventHandler;
  }> = [];

  private __event$ = new Subject<IFrameworkEvent>();

  private __dispatcher: FrameworkEventDispatcher<FrameworkEvent>;

  /**
   * Observable stream of all events dispatched through this provider.
   *
   * Subscribers receive events after dispatch but **cannot** call
   * `preventDefault` or `stopPropagation` — use `addEventListener` for
   * side-effect-capable handling.
   *
   * @returns An observable of framework events.
   */
  get event$(): Observable<IFrameworkEvent> {
    return this.__event$.asObservable();
  }

  /** Whether the provider has been disposed and can no longer dispatch. */
  get closed() {
    return this.__event$.closed;
  }

  /**
   * Creates a new event module provider.
   *
   * @param config - Configuration with optional `onDispatch` and `onBubble` hooks.
   */
  constructor(config: IEventModuleConfigurator) {
    super({ version, config });
    this.__dispatcher = new FrameworkEventDispatcher({
      onDispatch: config.onDispatch,
      onBubble: config.onBubble,
    });
    // complete the event$ subject when the provider is disposed
    // and clear the listeners
    this._addTeardown(() => {
      this.__listeners = [];
      this.__event$.complete();
    });
  }

  /**
   * Registers an event listener for the given event name.
   *
   * @param type - The event name to listen for.
   * @param handler - Callback invoked when a matching event is dispatched.
   * @returns A teardown function that removes the listener.
   * @throws {Error} When the provider has been disposed.
   *
   * @example
   * ```ts
   * const teardown = provider.addEventListener('myEvent', (event) => {
   *   console.log(event.detail);
   * });
   * // later
   * teardown();
   * ```
   */
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

  /**
   * Dispatches an event by name with initialization options, or dispatches a
   * pre-constructed {@link FrameworkEvent} instance.
   *
   * @param typeOrEvent - An event name string or a `FrameworkEvent` instance.
   * @param init - Initialization options (required when `typeOrEvent` is a string).
   * @returns The dispatched event after all listeners and bubble hooks have run.
   * @throws {Error} When `typeOrEvent` is a string but `init` is missing.
   */
  public async dispatchEvent(
    typeOrEvent: string | FrameworkEvent,
    init?: FrameworkEventInit,
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

  /**
   * Internal dispatch implementation that pushes the event into the observable
   * stream, resolves matching listeners, and invokes the dispatcher.
   *
   * @param event - The event to dispatch.
   * @returns The event after dispatch completes.
   * @throws {Error} When the provider has been disposed.
   */
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
}
