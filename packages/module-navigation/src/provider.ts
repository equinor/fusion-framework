import { createRouter } from '@remix-run/router';
import type { AgnosticRouteObject, Router } from '@remix-run/router';

import { Navigator } from './navigator';
import type { INavigator } from './navigator';

import type { INavigationConfigurator } from './configurator';

export interface INavigationProvider {
    dispose: VoidFunction;
    createRouter(routes: AgnosticRouteObject[]): Router;
}

export class NavigationProvider implements INavigationProvider {
    #navigator: INavigator;

    constructor(args: { config: INavigationConfigurator }) {
        const { config } = args;
        this.#navigator = new Navigator({
            basename: config.basename,
            history: config.createHistory(),
        });
    }

    public createRouter(routes: AgnosticRouteObject[]) {
        const history = this.#navigator;
        return createRouter({
            basename: history.basename,
            history,
            routes,
        });
    }

    dispose() {
        this.#navigator.dispose();
    }
}
