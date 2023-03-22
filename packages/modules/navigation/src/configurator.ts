import type { History } from '@remix-run/router';

export interface INavigationConfigurator {
    basename?: string;
    history?: History;
}

export class NavigationConfigurator implements INavigationConfigurator {
    public history?: History;
    public basename?: string;
}
