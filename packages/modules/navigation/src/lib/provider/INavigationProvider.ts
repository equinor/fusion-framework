import type { Action, AgnosticRouteObject, Path, Router, To } from '@remix-run/router';

import type { INavigator } from '../../navigator';

import type { Observable } from 'rxjs';
import type { IModuleProvider } from '@equinor/fusion-framework-module';

export interface INavigationProvider extends IModuleProvider {
    /**
     * Observer navigation changes, will return localized paths
     */
    readonly state$: Observable<{ action: Action; location: Path }>;

    /**
     * Localized current path
     */
    readonly path: Path;

    /**
     * History controller
     */
    readonly navigator: INavigator;

    // TODO - create own router object type, too many mismatch on type
    createRouter(routes: AgnosticRouteObject[]): Router;

    /**
     * Create a localized pathname
     */
    createHref(to?: To): string;

    /**
     * Create a localized URL
     */
    createURL(to?: To): URL;

    /**
     * Execute a relative `push` navigation
     */
    push(to: To, state?: unknown): void;

    /**
     * Execute a relative `replace` navigation
     */
    replace(to: To, state?: unknown): void;
}
