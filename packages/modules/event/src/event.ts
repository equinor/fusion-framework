import type { ModuleInstance } from '@equinor/fusion-framework-module';
import type { IEventModuleProvider } from './provider';

import cloneDeep from 'lodash.clonedeep';

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

    /** Original payload of the event. */
    readonly originalDetail: FrameworkEventInitDetail<TInit>;

    /** Source of the event (dispatcher). */
    readonly source?: FrameworkEventInitSource<TInit>;

    /** Indicates whether the event can be canceled. */
    readonly cancelable?: boolean;

    /** Indicates whether the event detail is mutable */
    readonly allowEventDetailsMutation: boolean;

    /** Indicates whether the event has been canceled and should not be processed further. */
    readonly canceled?: boolean;

    /** Indicates whether the event can bubble up. */
    readonly bubbles?: boolean;

    /**
     * Updates the details of the framework event.
     *
     * @note updating the details should only be allowed if the event is mutable.
     *
     * @param fn - A function that takes the current draft of the event details and returns the updated details, or `void` to cancel the update.
     */
    updateDetails(
        fn: (
            details: FrameworkEventInitDetail<TInit>,
        ) => FrameworkEventInitDetail<TInit> | void | undefined,
    ): void;
}

/**
 * initial args of event
 *
 * @template TDetail - type of event detail, event data payload
 * @template TSource - type of event source
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FrameworkEventInit<TDetail = any, TSource = any> = {
    /** Event data */
    detail: TDetail;
    /** Flag for allowing to mutate event data */
    mutableDetails?: boolean;
    /** Source of the event trigger */
    source?: TSource;
    /** Flag for allowing events to be canceled */
    cancelable?: boolean;
    /** Timestamp of when event was created */
    created?: number;
    /** Flag for allowing event to propagate to parent scope  */
    canBubble?: boolean;
};

/** defer init type args of event */
export type FrameworkEventInitType<T> =
    T extends IFrameworkEvent<infer U> ? U : T extends FrameworkEvent<infer U> ? U : never;

/** defer name type of event */
export type FrameworkEventType<T> =
    T extends IFrameworkEvent<FrameworkEventInit, infer U> ? U : never;

export type FrameworkEventInitDetail<T> = T extends FrameworkEventInit<infer U> ? U : never;

export type FrameworkEventInitSource<T> =
    T extends FrameworkEventInit<unknown, infer U> ? U : never;

/** defer detail type of event */
export type FrameworkEventDetail<T> =
    T extends IFrameworkEvent<infer U> ? FrameworkEventInitDetail<U> : never;

/** defer source type of event */
export type FrameworkEventSource<T> =
    T extends IFrameworkEvent<infer U> ? FrameworkEventInitSource<U> : never;

/** event constructor of mapped event  */
export interface FrameworkEvent<TInit extends FrameworkEventInit> {
    new (type: keyof FrameworkEventMap, args: TInit): IFrameworkEvent<TInit>;
}

/** event constructor for unknown event */
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
 * - Access the event details, including the original details and any updates
 * - Check if the event is cancelable and whether it has been canceled
 * - Control whether the event can bubble up the event hierarchy
 * - Update the event details during the event lifecycle
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
    #originalDetail: FrameworkEventInitDetail<TInit>;
    #source?: FrameworkEventInitSource<TInit>;
    #canceled = false;
    #cancelable: boolean;
    #mutableDetails: boolean;
    #canBubble: boolean;
    #created: number = Date.now();

    constructor(
        private __type: string,
        args: TInit,
    ) {
        this.#detail = args.detail;
        this.#originalDetail = cloneDeep(args.detail);
        this.#mutableDetails = !!args.mutableDetails;
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
     * Gets the original event details that were passed to the `FrameworkEvent` constructor.
     * This property provides access to the original event details, which may have been modified by the `updateDetails` method.
     * @returns {FrameworkEventInitDetail<TInit>} The original event details.
     */
    public get originalDetail(): FrameworkEventInitDetail<TInit> {
        return this.#originalDetail;
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
     * Indicates whether the event details can be mutated.
     * If this property is `true`, the event details can be updated using the `updateDetails` method.
     * @returns {boolean} `true` if the event details can be mutated, `false` otherwise.
     */
    public get allowEventDetailsMutation(): boolean {
        return this.#mutableDetails;
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

    /**
     * Updates the event details using the provided function.
     *
     * @note If the event details are not mutable, an error will be thrown.
     *
     * @see {FrameworkEvent.originalDetail}
     *
     * @param fn - A function that takes the current event details and returns an updated version of the details.
     * The function can return `void` or `undefined` to indicate that no changes should be made.
     */
    public updateDetails(
        fn: (
            details: FrameworkEventInitDetail<TInit>,
        ) => FrameworkEventInitDetail<TInit> | void | undefined,
    ) {
        if (!this.#mutableDetails) {
            throw new Error('Event details are not mutable');
        }
        const detail = fn(this.#detail);
        this.#detail = detail === undefined ? this.#detail : detail;
    }
}
