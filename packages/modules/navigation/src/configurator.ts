import type { History } from '@remix-run/router';

export interface INavigationConfigurator {
    basename?: string;
    history?: History;
}

export class NavigationConfigurator implements INavigationConfigurator {
    public history?: History;
    public basename?: string;
    /**
     * indicates if the navigator should behave as a slave or master
     *
     * When in `slave` mode the navigator will change push to replace (since master handles pushing history)
     */
    mode?: 'MASTER' | 'SLAVE';
}
