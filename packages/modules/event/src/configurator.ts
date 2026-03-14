import type { FrameworkEvent } from './event';

/**
 * Configuration interface for the event module.
 *
 * Allows consumers to hook into the event dispatch lifecycle by providing
 * optional `onDispatch` and `onBubble` callbacks during module setup.
 *
 * @example
 * ```ts
 * const configurator: IEventModuleConfigurator = {
 *   onDispatch: (event) => {
 *     if (!isAllowed(event)) {
 *       event.preventDefault();
 *     }
 *   },
 * };
 * ```
 */
export interface IEventModuleConfigurator {
  /**
   * Callback invoked **before** listeners when an event is dispatched.
   *
   * Use this hook to inspect, log, or cancel events before they reach
   * registered listeners. Calling `event.preventDefault()` here prevents
   * listeners from executing.
   *
   * @param event - The event about to be dispatched.
   */
  onDispatch?: (event: FrameworkEvent) => Promise<void> | void;

  /**
   * Callback invoked **after** all listeners when an event still bubbles.
   *
   * Typically used internally to propagate events to a parent provider.
   * Not called if `preventDefault` or `stopPropagation` was invoked.
   *
   * @param event - The event that completed listener dispatch.
   */
  onBubble?: (event: FrameworkEvent) => Promise<void> | void;
}
