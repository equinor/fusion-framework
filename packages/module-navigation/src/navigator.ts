import type { History, Location, To } from '@remix-run/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import type { NavigationUpdate } from './types';

export interface INavigator extends Observable<NavigationUpdate>, History {
    readonly basename?: string;
    readonly value: NavigationUpdate;
    readonly location: NavigationUpdate['location'];
    dispose: VoidFunction;
}

export class Navigator extends Observable<NavigationUpdate> implements INavigator {
    #history: History;
    #baseName?: string;
    #subscriptions = new Subscription();
    #state: BehaviorSubject<NavigationUpdate>;

    get basename(): string | undefined {
        return this.#baseName;
    }

    get state(): Observable<NavigationUpdate> {
        return this.#state.asObservable();
    }

    get value(): NavigationUpdate {
        return this.#state.value;
    }

    get location(): NavigationUpdate['location'] {
        return this.value.location;
    }

    get action(): NavigationUpdate['action'] {
        return this.value.action;
    }

    constructor(args: { basename?: string; history: History }) {
        super((subscriber) => this.#state.subscribe(subscriber));
        const { basename, history } = args;
        this.#baseName = basename;
        this.#history = history;
        this.#state = new BehaviorSubject<NavigationUpdate>({
            action: this.#history.action,
            location: this.#history.location,
        });
        this.#subscriptions.add(this.#history.listen(this.#state.next.bind(this.#state)));
    }

    public encodeLocation(location: Location): Location {
        return this.#history.encodeLocation(location);
    }

    public listen(listener: (next: NavigationUpdate) => void): VoidFunction {
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

    dispose() {
        this.#subscriptions.unsubscribe();
    }
}
