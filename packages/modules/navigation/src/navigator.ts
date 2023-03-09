import type { History, To, Path } from '@remix-run/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import type { NavigationUpdate, NavigationListener } from './types';

export interface INavigator<T extends NavigationUpdate = NavigationUpdate>
    extends Observable<T>,
        History {
    readonly basename?: string;
    readonly origin?: string;
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
    #origin?: string = window.location.origin;
    #subscriptions = new Subscription();
    #state: BehaviorSubject<T>;

    #logger: typeof console;

    get basename(): string | undefined {
        return this.#baseName;
    }
    get origin(): string | undefined {
        return this.#origin;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(args: { basename?: string; history: History; logger?: any }) {
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
                if (update.location.key !== this.#state.value.location.key) {
                    this.#logger.debug(
                        'Navigator::constructor',
                        'history changed',
                        update,
                        this.#state.value
                    );
                    this.#state.next(update as T);
                }
            })
        );
    }

    public encodeLocation(to: To): Path {
        return this.#history.encodeLocation(to);
    }

    public listen(listener: NavigationListener): VoidFunction {
        this.#logger.debug('Navigator::listen', listener);
        const subscription = this.#state.subscribe((x) => {
            this.#logger.debug('Navigator::listen[onchange]', x);
            listener(x);
        });
        return () => {
            this.#logger.debug('Navigator::listen[unsubscribe]');
            return subscription.unsubscribe();
        };
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
