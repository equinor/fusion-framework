import { createRouter } from '@remix-run/router';
import type { AgnosticRouteObject, Router } from '@remix-run/router';

import { Navigator } from './navigator';
import type { INavigator } from './navigator';

import type { INavigationConfigurator } from './configurator';

export interface INavigationProvider {
    dispose: VoidFunction;
    createRouter(routes: AgnosticRouteObject[]): Router;
    readonly navigator: INavigator;
}

export class NavigationProvider implements INavigationProvider {
    #navigator: INavigator;

    public get navigator(): INavigator {
        return this.#navigator;
    }

    constructor(args: { config: INavigationConfigurator }) {
        const {
            config: { basename, history },
        } = args;
        if (!history) {
            throw Error('no history provided!');
        }
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

    dispose() {
        this.#navigator.dispose();
    }
}
