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
    readonly detail?: FrameworkEventInitDetail<TInit>;

    /** source of event (dispatcher) */
    readonly source?: FrameworkEventInitSource<TInit>;

    readonly cancelable?: boolean;
    readonly canceled?: boolean;
    readonly bubbles?: boolean;
}

/** initial args of event  */
export type FrameworkEventInit<TDetail = unknown, TSource = unknown> = {
    detail?: TDetail;
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

export type FrameworkEventInitSource<T> = T extends FrameworkEventInit<infer U> ? U : never;

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
export class FrameworkEvent<
    TInit extends FrameworkEventInit = FrameworkEventInit,
    TType extends string = keyof FrameworkEventMap
> implements IFrameworkEvent<TInit, TType>
{
    private __detail?: FrameworkEventInitDetail<TInit>;
    private __source?: FrameworkEventInitSource<TInit>;
    private __canceled = false;
    private __cancelable: boolean;
    private __canBubble: boolean;
    private __created: number = Date.now();

    constructor(private __type: string, args: TInit) {
        this.__detail = args.detail as FrameworkEventInitDetail<TInit>;
        this.__source = args.source as FrameworkEventInitSource<TInit>;
        this.__cancelable = !!args.cancelable;
        this.__canBubble = args.canBubble === undefined ? true : args.canBubble;
    }

    /** flag for if the event can propagate */
    public get bubbles(): boolean {
        return this.__canBubble && !this.__canceled;
    }

    public get created(): number {
        return this.__created;
    }

    public get cancelable(): boolean {
        return this.__cancelable;
    }

    public get canceled(): boolean {
        return this.__canceled;
    }

    public get detail(): FrameworkEventInitDetail<TInit> | undefined {
        return this.__detail;
    }

    public get source(): FrameworkEventInitSource<TInit> | undefined {
        return this.__source;
    }

    public get type(): TType {
        return this.__type as TType;
    }

    /** cancel the event */
    public preventDefault() {
        if (this.cancelable) {
            this.__canceled = true;
        }
    }

    /** prevent event to bubble */
    public stopPropagation(): void {
        this.__canBubble = false;
    }
}
