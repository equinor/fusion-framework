import type { ModuleInstance } from '@equinor/fusion-framework-module';
import type { IEventModuleProvider } from './provider';

export declare interface FrameworkEventMap {
    onModulesLoaded: FrameworkEvent<FrameworkEventInit<ModuleInstance, IEventModuleProvider>>;
}

export type FrameworkEventHandler<TType extends IFrameworkEvent = IFrameworkEvent> = (
    event: TType
) => Promise<void> | void;

export interface IFrameworkEvent<
    TInit extends FrameworkEventInit = FrameworkEventInit,
    TType extends string = string
> {
    /** name of event */
    readonly type: TType;

    /** timestamp of creation */
    readonly created: number;

    /** payload of event */
    readonly detail: FrameworkEventInitDetail<TInit>;

    /** source of event (dispatcher) */
    readonly source?: FrameworkEventInitSource<TInit>;

    readonly cancelable?: boolean;
    readonly canceled?: boolean;
    readonly bubbles?: boolean;
}

/** initial args of event  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FrameworkEventInit<TDetail = any, TSource = any> = {
    detail: TDetail;
    source?: TSource;
    cancelable?: boolean;
    created?: number;
    canBubble?: boolean;
};

/** defer init type args of event */
export type FrameworkEventInitType<T> = T extends IFrameworkEvent<infer U> ? U : never;

/** defer name type of event */
export type FrameworkEventType<T> = T extends IFrameworkEvent<FrameworkEventInit, infer U>
    ? U
    : never;

export type FrameworkEventInitDetail<T> = T extends FrameworkEventInit<infer U> ? U : never;

export type FrameworkEventInitSource<T> = T extends FrameworkEventInit<unknown, infer U>
    ? U
    : never;

/** defer detail type of event */
export type FrameworkEventDetail<T> = T extends IFrameworkEvent<infer U>
    ? FrameworkEventInitDetail<U>
    : never;

/** defer source type of event */
export type FrameworkEventSource<T> = T extends IFrameworkEvent<infer U>
    ? FrameworkEventInitSource<U>
    : never;

/** event constructor of mapped event  */
export interface FrameworkEvent<TInit extends FrameworkEventInit> {
    new (type: keyof FrameworkEventMap, args: TInit): IFrameworkEvent<TInit>;
}

/** event constructor for unknown event */
export interface FrameworkEvent<TInit extends FrameworkEventInit> {
    new (type: string, args: TInit): IFrameworkEvent<TInit>;
}

/**
 * Event Object
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class FrameworkEvent<
    TInit extends FrameworkEventInit = FrameworkEventInit,
    TType extends string = keyof FrameworkEventMap
> implements IFrameworkEvent<TInit, TType>
{
    #detail: FrameworkEventInitDetail<TInit>;
    #source?: FrameworkEventInitSource<TInit>;
    #canceled = false;
    #cancelable: boolean;
    #canBubble: boolean;
    #created: number = Date.now();

    constructor(private __type: string, args: TInit) {
        this.#detail = args.detail as FrameworkEventInitDetail<TInit>;
        this.#source = args.source as FrameworkEventInitSource<TInit>;
        this.#cancelable = !!args.cancelable;
        this.#canBubble = args.canBubble === undefined ? true : args.canBubble;
    }

    /** flag for if the event can propagate */
    public get bubbles(): boolean {
        return this.#canBubble && !this.#canceled;
    }

    public get created(): number {
        return this.#created;
    }

    public get cancelable(): boolean {
        return this.#cancelable;
    }

    public get canceled(): boolean {
        return this.#canceled;
    }

    public get detail(): FrameworkEventInitDetail<TInit> {
        return this.#detail;
    }

    public get source(): FrameworkEventInitSource<TInit> | undefined {
        return this.#source;
    }

    public get type(): TType {
        return this.__type as TType;
    }

    /** cancel the event */
    public preventDefault() {
        if (this.cancelable) {
            this.#canceled = true;
        }
    }

    /** prevent event to bubble */
    public stopPropagation(): void {
        this.#canBubble = false;
    }
}
