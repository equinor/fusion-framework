import {
    createRouter,
    type Action,
    type AgnosticRouteObject,
    type Location,
    type Path,
    type Router,
    type To,
} from '@remix-run/router';

import { Navigator } from './navigator';
import type { INavigator } from './navigator';

import type { INavigationConfigurator } from './configurator';
import { Observable } from 'rxjs';

export interface INavigationProvider extends Observable<{ action: Action; path: Path }> {
    readonly path: Path;
    readonly navigator: INavigator;
    dispose: VoidFunction;
    createRouter(routes: AgnosticRouteObject[]): Router;
    createHref(to: To): string;
    createURL(to: To): URL;
    push(to: To, state?: unknown): void;
    replace(to: To, state?: unknown): void;
}

export class NavigationProvider
    extends Observable<{ action: Action; path: Path }>
    implements INavigationProvider
{
    #navigator: INavigator;
    #basePathname?: string;

    public get navigator(): INavigator {
        return this.#navigator;
    }

    public get path(): Path {
        const { pathname, search, hash } = this.navigator.location;
        return {
            pathname: pathname.replace(this.#basePathname ?? '', ''),
            search,
            hash,
        };
    }

    constructor(args: { config: INavigationConfigurator }) {
        super((subscriber) =>
            this.#navigator.subscribe(({ action, location }) => {
                subscriber.next({
                    action,
                    path: this._localizeLocation(location),
                });
            })
        );
        const {
            config: { basename, history },
        } = args;
        if (!history) {
            throw Error('no history provided!');
        }
        this.#basePathname = basename;
        this.#navigator = new Navigator({
            basename,
            history,
        });
    }

    public createRouter(routes: AgnosticRouteObject[]) {
        const history = this.#navigator;
        console.debug('NavigationProvider::createRouter', history, routes);
        const router = createRouter({
            basename: history.basename,
            history,
            routes,
        });
        router.initialize();
        return router;
    }

    public createHref(to: To): string {
        return this.#navigator.createHref(this._createToPath(to));
    }

    public createURL(to: To): URL {
        return this.#navigator.createURL(this._createToPath(to));
    }

    public push(to: To, state?: unknown): void {
        return this.#navigator.push(this._createToPath(to), state);
    }

    public replace(to: To, state?: unknown): void {
        return this.#navigator.replace(this._createToPath(to), state);
    }

    protected _localizeLocation(location: Location) {
        const { pathname, search, hash } = location;
        return {
            // TODO make better check
            pathname: pathname.replace(this.#basePathname ?? '', ''),
            search,
            hash,
        };
    }

    protected _createToPath(to: To): Partial<Path> {
        const { pathname, search, hash } =
            typeof to === 'string' ? { pathname: to, search: undefined, hash: undefined } : to;
        return {
            pathname: [this.path.pathname, pathname].filter((x) => !!x).join('/'),
            search,
            hash,
        };
    }

    dispose() {
        this.#navigator.dispose();
    }
}
