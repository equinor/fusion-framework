import { useCallback, useMemo, useState } from 'react';
import { Observable } from 'rxjs';

import { type AppSettings } from '@equinor/fusion-framework-module-app';

import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { useObservableState } from '@equinor/fusion-observable/react';

import { useAppSettingsStatus, type AppSettingsStatusHooks } from './useAppSettingsStatus';
/**
 * Custom hook to manage application settings.
 *
 * @template TSettings - The type of the settings object, extending Record<string, any>. Defaults to AppSettings.
 *
 * @param {TSettings} [defaultValue] - The default value for the settings.
 * @param hooks - Optional hooks to handle the status changes and errors.
 *
 * @note
 * `defaultValue` will only be used on the first render.
 * `hooks`must be memoized to avoid unnecessary re-renders.
 *
 * @returns {Array} An array containing:
 * - `settings`: The current settings object.
 * - `setSettings`: A function to update the settings.
 *
 * @example
 * const [settings, setSettings] = useAppSettings();
 *
 * @example
 * const [settings, setSettings] = useAppSettings({ theme: 'dark' });
 *
 * @example
 * const [isLoading, setIsLoading] = useState(false);
 * const [isUpdating, setIsUpdating] = useState(false);
 * const [error, setError] = useState<Error | null>(null);
 *
 * const onUpdated = useCallback(() => console.log('Settings updated'), []);
 *
 * const [settings, setSettings] = useAppSettings({ theme: 'dark' }, {
 *  onLoading: setIsLoading,
 *  onUpdating: setIsUpdating,
 *  onError: setError,
 *  onUpdated,
 * });
 */
export const useAppSettings = <TSettings extends Record<string, unknown> = AppSettings>(
    defaultValue?: TSettings,
    hooks?: AppSettingsStatusHooks & {
        onError?: (error: Error | null) => void;
        onUpdated?: () => void;
    },
): [TSettings, (settings: TSettings) => void] => {
    const { onError, onUpdated, onLoading, onUpdating } = hooks ?? {};
    const { currentApp = null } = useCurrentApp();

    const { value: settings } = useObservableState(
        useMemo(() => currentApp?.settings$ as Observable<TSettings>, [currentApp]),
        { initial: defaultValue },
    );

    const setSettings = useCallback(
        (settings: TSettings) => {
            if (!currentApp) {
                return onError?.(new Error('App is not available'));
            }

            currentApp.updateSettings(settings).subscribe({
                next: () => {
                    onUpdated?.();
                    onError?.(null);
                },
                error: onError,
            });
        },
        [currentApp, onError, onUpdated],
    );

    useAppSettingsStatus(currentApp, { onLoading, onUpdating });

    return [settings, setSettings];
};

export default useAppSettings;
