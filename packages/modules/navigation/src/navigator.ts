import type { History, To, Path } from '@remix-run/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import type { NavigationUpdate, NavigationListener } from './types';

export interface INavigator<T extends NavigationUpdate = NavigationUpdate>
    extends Observable<T>,
        History {
    readonly basename?: string;
    readonly value: NavigationUpdate;
    readonly location: NavigationUpdate['location'];
    dispose: VoidFunction;
}

export class Navigator<T extends NavigationUpdate = NavigationUpdate>
    extends Observable<T>
    implements INavigator<T>
{
    #history: History;
    #baseName?: string;
    #subscriptions = new Subscription();
    #state: BehaviorSubject<T>;

    get basename(): string | undefined {
        return this.#baseName;
    }

    get state(): Observable<T> {
        return this.#state.asObservable();
    }

    get value(): T {
        return this.#state.value;
    }

    get location(): T['location'] {
        return this.value.location;
    }

    get action(): T['action'] {
        return this.value.action;
    }

    constructor(args: { basename?: string; history: History }) {
        super((subscriber) => this.#state.subscribe(subscriber));
        const { basename, history } = args;
        this.#baseName = basename;
        this.#history = history;
        this.#state = new BehaviorSubject<T>({
            action: this.#history.action,
            location: this.#history.location,
            delta: null,
        } as T);
        this.#subscriptions.add(this.#history.listen((update) => this.#state.next(update as T)));
    }

    public encodeLocation(to: To): Path {
        return this.#history.encodeLocation(to);
    }

    public listen(listener: NavigationListener): VoidFunction {
        return this.subscribe(listener).unsubscribe.bind(this);
    }

    public createHref(to: To): string {
        return this.#history.createHref(to);
    }

    public go(delta: number): void {
        this.#history.go(delta);
    }

    public push(to: To, state?: unknown): void {
        return this.#history.push(to, state);
    }

    public replace(to: To, state?: unknown): void {
        return this.#history.replace(to, state);
    }

    public createURL(to: To): URL {
        return this.#history.createURL(to);
    }

    dispose() {
        this.#subscriptions.unsubscribe();
    }
}
