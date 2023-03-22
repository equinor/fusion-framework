import { createBrowserHistory, createHashHistory, createMemoryHistory } from '@remix-run/router';
import type { History } from '@remix-run/router';

type HistoryType = 'browser' | 'hash' | 'memory';

export const createHistory = (type?: HistoryType): History => {
    switch (type) {
        case 'hash':
            return createHashHistory({ v5Compat: true });
        case 'memory':
            return createMemoryHistory({ v5Compat: true });
        case 'browser':
        default:
            return createBrowserHistory({
                v5Compat: true,
            });
    }
};
