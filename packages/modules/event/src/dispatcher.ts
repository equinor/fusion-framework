import type { IFrameworkEvent } from './event';

/**
 * Callback invoked when a framework event is dispatched or bubbled.
 *
 * Handlers may be synchronous or asynchronous. For cancelable events the
 * dispatcher `await`s each handler so that `preventDefault` is respected.
 *
 * @template TType - The concrete event type handled.
 * @param event - The framework event being processed.
 * @returns A promise that resolves when the handler completes, or void.
 */
export type FrameworkEventHandler<TType extends IFrameworkEvent = IFrameworkEvent> = (
  event: TType,
) => Promise<void> | void;

/**
 * Contract for an object that dispatches a framework event to a set of
 * listeners.
 *
 * @template TEvent - The event type that can be dispatched.
 */
export interface IFrameworkDispatcher<TEvent extends IFrameworkEvent> {
  /**
   * Dispatches the event to the given listeners sequentially.
   *
   * For cancelable events each listener is awaited so that a call to
   * `preventDefault` stops subsequent listeners from running.
   *
   * @param event - The event to dispatch.
   * @param listeners - Ordered array of handlers to invoke.
   */
  dispatch(event: TEvent, listeners: Array<FrameworkEventHandler<TEvent>>): Promise<void>;
}

/**
 * Internal representation of a dispatched event that tracks its owning
 * dispatcher to detect re-entrant dispatch loops.
 */
interface FrameworkDispatchEvent<TEvent extends IFrameworkEvent> extends IFrameworkEvent {
  dispatcher: IFrameworkDispatcher<TEvent>;
}

/**
 * Constructor options for {@link FrameworkEventDispatcher}.
 *
 * @template TEvent - The event type handled by the dispatcher.
 */
export type FrameworkEventDispatcherCtorArgs<TEvent extends IFrameworkEvent> = {
  onDispatch?: FrameworkEventHandler<TEvent>;
  onBubble?: FrameworkEventHandler<TEvent>;
};

/**
 * Default event dispatcher that invokes listeners sequentially and supports
 * pre-dispatch and post-bubble hooks.
 *
 * Cancelable events are dispatched with `await` so that any listener calling
 * `event.preventDefault()` stops later listeners. Non-cancelable events are
 * fired without awaiting.
 *
 * After all listeners have run, if the event still bubbles, the optional
 * `onBubble` hook is called (typically forwarding the event to a parent
 * provider).
 *
 * @template TEvent - The concrete event type dispatched.
 */
export class FrameworkEventDispatcher<TEvent extends IFrameworkEvent>
  implements IFrameworkDispatcher<TEvent>
{
  private __onDispatch?: FrameworkEventHandler<TEvent>;
  private __onBubble?: FrameworkEventHandler<TEvent>;

  /**
   * Creates a new dispatcher with optional pre-dispatch and bubble hooks.
   *
   * @param options - Hooks invoked during event dispatch lifecycle.
   * @param options.onDispatch - Called before listeners, can cancel the event.
   * @param options.onBubble - Called after listeners if the event still bubbles.
   */
  constructor({ onDispatch, onBubble }: FrameworkEventDispatcherCtorArgs<TEvent>) {
    this.__onDispatch = onDispatch;
    this.__onBubble = onBubble;
  }

  /**
   * Dispatches the event through the pre-dispatch hook, listeners, and
   * bubble hook in order.
   *
   * A loop-detection guard prevents the same dispatcher from processing an
   * event it has already dispatched.
   *
   * @param event - The event to dispatch.
   * @param listeners - Ordered array of handlers to invoke.
   * @throws {Error} When a dispatch loop is detected.
   */
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
