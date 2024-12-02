import { useLayoutEffect } from 'react';
import { map } from 'rxjs';

import type { IApp } from '@equinor/fusion-framework-module-app';

export type AppSettingsStatusHooks = {
    onLoading?: (isLoading: boolean) => void;
    onUpdating?: (isUpdating: boolean) => void;
};

/**
 * Custom hook to handle app settings status updates.
 *
 * @param {IApp | null} app - The app instance to monitor settings status.
 * @param {AppSettingsStatusHooks} [hooks] - Optional hooks to handle loading and updating status.
 * @param {function} [hooks.onLoading] - Callback function to handle loading status.
 * @param {function} [hooks.onUpdating] - Callback function to handle updating status.
 *
 * @returns {void}
 *
 * @example
 * const hooks = useMemo(() => ({
 *   onLoading: (isLoading) => console.log('Loading:', isLoading),
 *   onUpdating: (isUpdating) => console.log('Updating:', isUpdating),
 * }, []);
 * useAppSettingsStatus(app, hooks);
 */
export const useAppSettingsStatus = (app: IApp | null, hooks?: AppSettingsStatusHooks) => {
    const { onLoading, onUpdating } = hooks ?? {};

    useLayoutEffect(() => {
        if (app && onLoading) {
            const subscription = app.status$
                .pipe(map((status) => status.has('fetch_settings')))
                .subscribe(onLoading);
            return () => subscription.unsubscribe();
        }
    }, [app, onLoading]);

    useLayoutEffect(() => {
        if (app && onUpdating) {
            const subscription = app.status$
                .pipe(map((status) => status.has('update_settings')))
                .subscribe(onUpdating);
            return () => subscription.unsubscribe();
        }
    }, [app, onUpdating]);
};
