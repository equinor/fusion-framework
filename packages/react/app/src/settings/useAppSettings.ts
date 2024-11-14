import { useCallback, useMemo } from 'react';
import { type AppSettings } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { EMPTY } from 'rxjs';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';

/**
 * Hook for handling a users app settings
 * @returns {settings, updateSettings} Methods for getting and setting settings.
 */
export const useAppSettings = (): {
    settings: AppSettings | undefined;
    updateSettings: (settings: AppSettings) => Promise<AppSettings> | undefined;
} => {
    const { currentApp } = useCurrentApp();

    const { value: settings } = useObservableState(
        useMemo(() => currentApp?.getSettings() || EMPTY, [currentApp]),
    );

    const updateSettings = useCallback(
        (settings: AppSettings) => {
            return currentApp?.updateSettingsAsync(settings);
        },
        [currentApp],
    );

    return {
        settings,
        updateSettings,
    };
};

export default useAppSettings;
