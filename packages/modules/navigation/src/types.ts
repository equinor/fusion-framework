import type { History } from '@remix-run/router';

export type NavigationListener = Parameters<History['listen']>[0];
export type NavigationUpdate = Parameters<NavigationListener>[0];
