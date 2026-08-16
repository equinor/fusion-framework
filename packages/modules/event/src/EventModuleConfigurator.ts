import { BaseConfigBuilder } from '@equinor/fusion-framework-module';

import type { FrameworkEvent } from './FrameworkEvent';

/**
 * Resolved configuration for the event module.
 *
 * Allows consumers to hook into the event dispatch lifecycle by providing
 * optional `onDispatch` and `onBubble` callbacks during module setup.
 *
 * @example
 * ```ts
 * const configurator: EventModuleConfig = {
 *   onDispatch: (event) => {
 *     if (!isAllowed(event)) {
 *       event.preventDefault();
 *     }
 *   },
 * };
 * ```
 */
export type EventModuleConfig = {
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
};

/**
 * Configuration builder for the event module.
 *
 * Provides `setOnDispatch`/`setOnBubble` fluent setters for the event dispatch
 * lifecycle hooks, following the same {@link BaseConfigBuilder} pattern used by
 * other Fusion Framework module configurators.
 *
 * @example
 * ```ts
 * const configurator = new EventModuleConfigurator();
 * configurator.setOnDispatch((event) => {
 *   if (!isAllowed(event)) {
 *     event.preventDefault();
 *   }
 * });
 * ```
 */
export class EventModuleConfigurator extends BaseConfigBuilder<EventModuleConfig> {
  #onDispatch?: EventModuleConfig['onDispatch'];
  #onBubble?: EventModuleConfig['onBubble'];

  /** Creates a new event module configurator with no hooks set. */
  constructor() {
    super();
    // Read the private fields lazily so they reflect whichever setter ran last
    this._set('onDispatch', async () => this.#onDispatch);
    this._set('onBubble', async () => this.#onBubble);
  }

  /**
   * Sets the callback invoked **before** listeners when an event is dispatched.
   *
   * @param handler - Callback to inspect, log, or cancel the event via `event.preventDefault()`.
   * @returns The configurator instance, for chaining.
   */
  setOnDispatch(handler: EventModuleConfig['onDispatch']): this {
    this.#onDispatch = handler;
    return this;
  }

  /**
   * Sets the callback invoked **after** all listeners when an event still bubbles.
   *
   * @param handler - Callback typically used to forward the event to a parent provider.
   * @returns The configurator instance, for chaining.
   */
  setOnBubble(handler: EventModuleConfig['onBubble']): this {
    this.#onBubble = handler;
    return this;
  }

  /**
   * @param handler - Callback to inspect, log, or cancel the event via `event.preventDefault()`.
   * @deprecated Since 6.1.0. Use {@link EventModuleConfigurator.setOnDispatch} instead.
   */
  set onDispatch(handler: EventModuleConfig['onDispatch']) {
    this.#onDispatch = handler;
  }

  /**
   * @returns The currently configured `onDispatch` handler, if any.
   * @deprecated Since 6.1.0. Use {@link EventModuleConfigurator.setOnDispatch} instead.
   */
  get onDispatch(): EventModuleConfig['onDispatch'] {
    return this.#onDispatch;
  }

  /**
   * @param handler - Callback typically used to forward the event to a parent provider.
   * @deprecated Since 6.1.0. Use {@link EventModuleConfigurator.setOnBubble} instead.
   */
  set onBubble(handler: EventModuleConfig['onBubble']) {
    this.#onBubble = handler;
  }

  /**
   * @returns The currently configured `onBubble` handler, if any.
   * @deprecated Since 6.1.0. Use {@link EventModuleConfigurator.setOnBubble} instead.
   */
  get onBubble(): EventModuleConfig['onBubble'] {
    return this.#onBubble;
  }
}
