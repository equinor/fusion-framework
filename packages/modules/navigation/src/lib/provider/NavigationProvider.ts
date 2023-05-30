import { AgnosticRouteObject, createRouter, Path, To } from '@remix-run/router';

import { filter, map } from 'rxjs/operators';

import { BaseModuleProvider } from '@equinor/fusion-framework-module';

import { INavigationProvider } from './INavigationProvider';

import { type INavigationConfigurator } from '../../configurator';
import { Navigator, type INavigator } from '../../navigator';

const normalizePathname = (path: string) => path.replace(/\/+/g, '/');

export class NavigationProvider
    extends BaseModuleProvider<INavigationConfigurator>
    implements INavigationProvider
{
    #navigator!: INavigator;
    #basePathname?: string;

    public get state$() {
        return this.#navigator.pipe(
            /** only push navigation state if the path is within the basename scope */
            filter((event) =>
                this.#basePathname ? event.location.pathname.startsWith(this.#basePathname) : true
            ),
            /** map path to localized path */
            map(({ action, location }) => ({
                action,
                location: this._localizePath(location),
            }))
        );
    }

    public get navigator(): INavigator {
        return this.#navigator;
    }

    public get path(): Path {
        return this._localizePath(this.navigator.location);
    }

    protected _init(config: INavigationConfigurator): void {
        const { basename, history } = config;

        this.#basePathname = basename;

        if (!history) {
            throw Error('no history provided!');
        }

        this.#navigator = new Navigator({
            basename,
            history,
        });

        this._addTeardown(() => this.#navigator.dispose());
    }

    public createRouter(routes: AgnosticRouteObject[]) {
        const history = this.#navigator;
        console.debug('NavigationProvider::createRouter', routes);
        const router = createRouter({
            basename: history.basename,
            history,
            routes,
            future: {
                v7_prependBasename: true,
            },
        });
        router.initialize();
        return router;
    }

    public createHref(to?: To): string {
        return this.#navigator.createHref(this._createToPath(to ?? this.path));
    }

    public createURL(to?: To): URL {
        return this.#navigator.createURL(this._createToPath(to ?? this.path));
    }

    public push(to: To, state?: unknown): void {
        return this.#navigator.push(this._createToPath(to), state);
    }

    public replace(to: To, state?: unknown): void {
        return this.#navigator.replace(this._createToPath(to), state);
    }

    protected _localizePath(location: Path): Path {
        const { pathname, search, hash } = location;
        return {
            // TODO make better check
            pathname: normalizePathname(pathname.replace(this.#basePathname ?? '', '')),
            search,
            hash,
        };
    }

    protected _createToPath(to: To): Partial<Path> {
        const { pathname, search, hash } =
            typeof to === 'string' ? { pathname: to, search: undefined, hash: undefined } : to;
        return {
            pathname: normalizePathname(
                [this.#basePathname, pathname === '/' ? undefined : pathname]
                    .filter((x) => !!x)
                    .join('/')
            ),
            search,
            hash,
        };
    }
}
