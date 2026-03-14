import type { ModuleInstance } from '@equinor/fusion-framework-module';
import type { IEventModuleProvider } from './provider';

/**
 * Registry of known framework event names mapped to their event types.
 *
 * Module consumers extend this interface via declaration merging to register
 * custom event types. Registered events enable type-safe `addEventListener`
 * and `dispatchEvent` calls on {@link IEventModuleProvider}.
 *
 * @example
 * ```ts
 * declare module '@equinor/fusion-framework-module-event' {
 *   interface FrameworkEventMap {
 *     'myFeature': FrameworkEvent<FrameworkEventInit<MyPayload, MySource>>;
 *   }
 * }
 * ```
 */
export declare interface FrameworkEventMap {
  onModulesLoaded: FrameworkEvent<FrameworkEventInit<ModuleInstance, IEventModuleProvider>>;
}

/**
 * Represents a handler function for framework events.
 * @template TType - The type of the framework event.
 * @param event - The framework event object.
 * @returns A promise that resolves when the handler has completed its execution, or void if no promise is returned.
 */
export type FrameworkEventHandler<TType extends IFrameworkEvent = IFrameworkEvent> = (
  event: TType,
) => Promise<void> | void;

/**
 * Represents a framework event.
 *
 * @template TInit - The type of the event initialization options.
 * @template TType - The type of the event name.
 */
export interface IFrameworkEvent<
  TInit extends FrameworkEventInit = FrameworkEventInit,
  TType extends string = string,
> {
  /** Name of the event. */
  readonly type: TType;

  /** Timestamp of creation. */
  readonly created: number;

  /** Payload of the event. */
  readonly detail: FrameworkEventInitDetail<TInit>;

  /** Source of the event (dispatcher). */
  readonly source?: FrameworkEventInitSource<TInit>;

  /** Indicates whether the event can be canceled. */
  readonly cancelable?: boolean;

  /** Indicates whether the event has been canceled and should not be processed further. */
  readonly canceled?: boolean;

  /** Indicates whether the event can bubble up. */
  readonly bubbles?: boolean;
}

/**
 * Initialization options passed when constructing a {@link FrameworkEvent}.
 *
 * Defines the event payload (`detail`), optional `source`, cancelability,
 * creation timestamp, and bubble behavior.
 *
 * @template TDetail - Type of the event data payload.
 * @template TSource - Type of the object that triggered the event.
 */
// biome-ignore lint/suspicious/noExplicitAny: generic type parameters need flexibility
export type FrameworkEventInit<TDetail = any, TSource = any> = {
  /** Event data */
  detail: TDetail;
  /** Source of the event trigger */
  source?: TSource;
  /** Flag for allowing events to be canceled */
  cancelable?: boolean;
  /** Timestamp of when event was created */
  created?: number;
  /** Flag for allowing event to propagate to parent scope  */
  canBubble?: boolean;
};

/**
 * Extracts the {@link FrameworkEventInit} type parameter from a
 * {@link IFrameworkEvent} or {@link FrameworkEvent}.
 *
 * @template T - An event or event class to extract initialization args from.
 */
export type FrameworkEventInitType<T> =
  T extends IFrameworkEvent<infer U> ? U : T extends FrameworkEvent<infer U> ? U : never;

/**
 * Extracts the event name (type string) from a {@link IFrameworkEvent}.
 *
 * @template T - An event type to extract the name from.
 */
export type FrameworkEventType<T> =
  T extends IFrameworkEvent<FrameworkEventInit, infer U> ? U : never;

/**
 * Extracts the `detail` payload type from a {@link FrameworkEventInit}.
 *
 * @template T - A {@link FrameworkEventInit} type to extract the detail from.
 */
export type FrameworkEventInitDetail<T> = T extends FrameworkEventInit<infer U> ? U : never;

/**
 * Extracts the `source` type from a {@link FrameworkEventInit}.
 *
 * @template T - A {@link FrameworkEventInit} type to extract the source from.
 */
export type FrameworkEventInitSource<T> =
  T extends FrameworkEventInit<unknown, infer U> ? U : never;

/**
 * Extracts the `detail` payload type from an {@link IFrameworkEvent}.
 *
 * @template T - An event type to extract the detail from.
 */
export type FrameworkEventDetail<T> =
  T extends IFrameworkEvent<infer U> ? FrameworkEventInitDetail<U> : never;

/**
 * Extracts the `source` type from an {@link IFrameworkEvent}.
 *
 * @template T - An event type to extract the source from.
 */
export type FrameworkEventSource<T> =
  T extends IFrameworkEvent<infer U> ? FrameworkEventInitSource<U> : never;

/**
 * Constructor signature for creating a {@link FrameworkEvent} from a
 * registered event name in {@link FrameworkEventMap}.
 *
 * @template TInit - The initialization options type for the event.
 */
export interface FrameworkEvent<TInit extends FrameworkEventInit> {
  new (type: keyof FrameworkEventMap, args: TInit): IFrameworkEvent<TInit>;
}

/**
 * Constructor signature for creating a {@link FrameworkEvent} with an
 * arbitrary (unregistered) event name.
 *
 * @template TInit - The initialization options type for the event.
 */
export interface FrameworkEvent<TInit extends FrameworkEventInit> {
  new (type: string, args: TInit): IFrameworkEvent<TInit>;
}

/**
 * Represents a framework event with customizable details and behavior.
 *
 * The `FrameworkEvent` class implements the `IFrameworkEvent` interface and provides a way to create and manage events
 * with custom details and behavior. It allows you to:
 *
 * - Specify the event type and initial event details
 * - Access the event details
 * - Check if the event is cancelable and whether it has been canceled
 * - Control whether the event can bubble up the event hierarchy
 *
 * The `FrameworkEvent` class is designed to be used as a base class for creating custom event types that fit the needs
 * of your application or framework.
 *
 * @template TInit The type of the event details.
 * @template TType The type of the event type.
 */
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: no other way to define a class with multiple signatures
export class FrameworkEvent<
  TInit extends FrameworkEventInit = FrameworkEventInit,
  TType extends string = keyof FrameworkEventMap,
> implements IFrameworkEvent<TInit, TType>
{
  #detail: FrameworkEventInitDetail<TInit>;
  #source?: FrameworkEventInitSource<TInit>;
  #canceled = false;
  #cancelable: boolean;
  #canBubble: boolean;
  #created: number = Date.now();

  /**
   * Creates a new framework event.
   *
   * @param __type - The event name used for listener matching.
   * @param args - Initialization options including detail payload, source, and flags.
   */
  constructor(
    private __type: string,
    args: TInit,
  ) {
    this.#detail = args.detail;
    this.#source = args.source;
    this.#cancelable = !!args.cancelable;
    this.#canBubble = args.canBubble === undefined ? true : args.canBubble;
  }

  /**
   * Indicates whether the event can bubble up the event hierarchy.
   * The event will only bubble if this property is `true` and the event has not been canceled.
   * @returns {boolean} `true` if the event can bubble, `false` otherwise.
   */
  public get bubbles(): boolean {
    return this.#canBubble && !this.#canceled;
  }

  /**
   * Gets the timestamp when the `FrameworkEvent` was created.
   * @returns {number} The timestamp of when the `FrameworkEvent` was created.
   */
  public get created(): number {
    return this.#created;
  }

  /**
   * Indicates whether the event is cancelable.
   * If the event is cancelable, it can be prevented from occurring by calling the `preventDefault()` method.
   * @returns {boolean} `true` if the event is cancelable, `false` otherwise.
   */
  public get cancelable(): boolean {
    return this.#cancelable;
  }

  /**
   * Indicates whether the event has been canceled.
   * If the event is cancelable and `preventDefault()` has been called, this property will be `true`.
   * @returns {boolean} `true` if the event has been canceled, `false` otherwise.
   */
  public get canceled(): boolean {
    return this.#canceled;
  }

  /**
   * Gets the current event details.
   * @returns {FrameworkEventInitDetail<TInit>} The current event details.
   */
  public get detail(): FrameworkEventInitDetail<TInit> {
    return this.#detail;
  }

  /**
   * Gets the source object that triggered the event.
   * @returns {FrameworkEventInitSource<TInit> | undefined} The source object that triggered the event, or `undefined` if the source is not available.
   */
  public get source(): FrameworkEventInitSource<TInit> | undefined {
    return this.#source;
  }

  /**
   * Gets the type of the `FrameworkEvent`.
   * @returns {TType} The type of the `FrameworkEvent`.
   */
  public get type(): TType {
    return this.__type as TType;
  }

  /**
   * Prevents the default action of the event from occurring, if the event is cancelable.
   * If the event is cancelable, this method sets the `canceled` property to `true`.
   */
  public preventDefault() {
    if (this.cancelable) {
      this.#canceled = true;
    }
  }

  /**
   * Prevents the event from bubbling up the DOM tree, effectively stopping its propagation.
   * This method sets the `#canBubble` property to `false`, which indicates that the event should not be propagated further.
   */
  public stopPropagation(): void {
    this.#canBubble = false;
  }
}
