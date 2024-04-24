import type { History, To, Path, Location } from '@remix-run/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import type { NavigationUpdate, NavigationListener } from './types';

/**
 * Interface representing a navigator that extends both an observable of navigation updates and the History interface.
 */
export interface INavigator<T extends NavigationUpdate = NavigationUpdate>
    extends Observable<T>,
        History {
    readonly basename?: string;
    readonly origin?: string;
    readonly value: NavigationUpdate;
    readonly location: NavigationUpdate['location'];
    dispose: VoidFunction;
}

/**
 * Type guard to check if a given 'to' parameter is a Location object.
 * @param to - The object to check.
 * @returns True if 'to' is a Location object, false otherwise.
 */
const isLocation = (to: To): to is Location => typeof to === 'object' && 'key' in to;

/**
 * Class representing a navigator that manages navigation and history state.
 */
export class Navigator<T extends NavigationUpdate = NavigationUpdate>
    extends Observable<T>
    implements INavigator<T>
{
    #history: History;
    #baseName?: string;
    #origin?: string = window.location.origin;
    #subscriptions = new Subscription();
    #state: BehaviorSubject<T>;

    #logger: typeof console;

    /**
     * Gets the basename of the navigator.
     */
    get basename(): string | undefined {
        return this.#baseName;
    }

    /**
     * Gets the origin of the navigator.
     */
    get origin(): string | undefined {
        return this.#origin;
    }

    /**
     * Gets the current navigation state as an observable.
     */
    get state(): Observable<T> {
        return this.#state.asObservable();
    }

    /**
     * Gets the current navigation state value.
     */
    get value(): T {
        return this.#state.value;
    }

    /**
     * Gets the current location from the navigation state.
     */
    get location(): T['location'] {
        return this.value.location;
    }

    /**
     * Gets the current action from the navigation state.
     */
    get action(): T['action'] {
        return this.value.action;
    }

    /**
     * Navigator constructor.
     * @param args - Configuration options for the navigator.
     */
    constructor(args: {
        basename?: string;
        history: History;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger?: any;
        mode?: 'MASTER' | 'SLAVE';
    }) {
        super((subscriber) => this.#state.subscribe(subscriber));
        const { basename, history } = args;
        this.#logger = args.logger || console;
        this.#baseName = basename;
        this.#history = history;
        this.#state = new BehaviorSubject<T>({
            action: this.#history.action,
            location: this.#history.location,
            delta: null,
        } as T);
        this.#subscriptions.add(
            this.#history.listen((update) => {
                // Prevent duplicate state updates.
                if (update.location.key !== this.#state.value.location.key) {
                    this.#state.next(update as T);
                }
            }),
        );
    }

    /**
     * Encodes a location into a path string.
     * @param to - The location to encode.
     * @returns The encoded path string.
     */
    public encodeLocation(to: To): Path {
        return this.#history.encodeLocation(to);
    }

    /**
     * Subscribes to navigation updates.
     * @param listener - The listener function to receive updates.
     * @returns A function to unsubscribe the listener.
     */
    public listen(listener: NavigationListener): VoidFunction {
        const subscription = this.#state.subscribe(listener);
        this.#logger.debug('Navigator::listen', listener);
        return () => {
            this.#logger.debug('Navigator::listen[unsubscribe]', listener);
            return subscription.unsubscribe();
        };
    }

    /**
     * Creates a URL string for a given location.
     * @param to - The location to create a URL for.
     * @returns The created URL string.
     */
    public createHref(to: To): string {
        return this.#history.createHref(to);
    }

    /**
     * Navigates to a specific history entry by its relative position to the current entry.
     * @param delta - The relative position to move in the history stack.
     */
    public go(delta: number): void {
        this.#history.go(delta);
    }

    /**
     * Pushes a new entry onto the history stack.
     * @param to - The location or URL to navigate to.
     * @param state - Optional state to associate with the navigation.
     */
    public push(to: To, state?: unknown): void {
        const skip = isLocation(to) && this._isDuplicateLocation(to);
        if (!skip) {
            return this.#history.push(to, state);
        }
    }

    /**
     * Replaces the current history entry with a new one.
     * @param to - The location or URL to navigate to.
     * @param state - Optional state to associate with the navigation.
     */
    public replace(to: To, state?: unknown): void {
        const skip = isLocation(to) && this._isDuplicateLocation(to);
        if (!skip) {
            return this.#history.replace(to, state);
        }
    }

    /**
     * Creates a full URL for a given location.
     * @param to - The location to create a URL for.
     * @returns The created URL object.
     */
    public createURL(to: To): URL {
        return this.#history.createURL(to);
    }

    /**
     * Checks if a given location is a duplicate of the current location.
     * @param location - The location to check.
     * @returns True if the location is a duplicate, false otherwise.
     */
    protected _isDuplicateLocation(location: Location) {
        // TODO: might check if there are changes in the URL compared to the current location.
        return location.key === this.#state.value.location.key;
    }

    /**
     * Disposes of the navigator by unsubscribing from all subscriptions.
     */
    dispose() {
        this.#subscriptions.unsubscribe();
    }
}
