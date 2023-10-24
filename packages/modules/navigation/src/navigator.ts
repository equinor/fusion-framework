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

    constructor(args: {
        basename?: string;
        history: History;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger?: any;
        mode?: 'MASTER' | 'SLAVE';
    }) {
        super((subscriber) => this.#state.subscribe(subscriber));
        const { basename, history, mode } = args;
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
                /** prevent duplicate navigation */
                if (update.location.key === this.#state.value.location.key) {
                    return;
                }
                this.#logger.debug('Navigator::#history.listen', {
                    update,
                    current: this.#state.value,
                });
                if (update.action === 'PUSH' && mode !== 'MASTER') {
                    this.#logger.debug(
                        'Navigator::#history.listen',
                        'switching action ro [REPLACE], since navigator is not master',
                    );
                    this.#state.next({ ...update, action: 'REPLACE' } as T);
                }
                this.#state.next(update as T);
            }),
        );
    }

    public encodeLocation(to: To): Path {
        return this.#history.encodeLocation(to);
    }

    public listen(listener: NavigationListener): VoidFunction {
        const subscription = this.#state.subscribe(listener);
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
