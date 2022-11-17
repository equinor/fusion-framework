import { createBrowserHistory, createHashHistory, createMemoryHistory } from '@remix-run/router';
import type { History } from '@remix-run/router';

type HistoryType = 'browser' | 'hash' | 'memory';

export interface INavigationConfigurator {
    historyType: HistoryType;
    createHistory: () => History;
    basename?: string;
}

export class NavigationConfigurator implements INavigationConfigurator {
    public historyType: HistoryType = 'browser';
    public basename?: string;

    public createHistory(): History {
        switch (this.historyType) {
            case 'browser':
                return createBrowserHistory({
                    v5Compat: true,
                });
            case 'hash':
                return createHashHistory({ v5Compat: true });
            case 'memory':
                return createMemoryHistory({ v5Compat: true });
        }
    }
}
