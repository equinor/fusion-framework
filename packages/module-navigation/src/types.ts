import type { Action, Location } from '@remix-run/router';

export type NavigationUpdate = {
    action: Action;
    location: Location;
};
