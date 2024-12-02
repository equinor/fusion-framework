import { useCallback, useMemo, useState } from 'react';
import { map, Observable } from 'rxjs';

import { useCurrentApp } from '@equinor/fusion-framework-react/app';

import { useAppSettingsStatus, type AppSettingsStatusHooks } from './useAppSettingsStatus';

import type { AppSettings } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';

/**
 * Custom hook to manage application settings.
 *
 * @template TSettings - The type of the settings object. Defaults to `AppSettings`.
 * @template TProp - The type of the property key in the settings object. Defaults to `keyof TSettings`.
 *
 * @param {TProp} prop - The property key in the settings object to manage.
 * @param {TSettings[TProp]} [defaultSettings] - The default value for the setting.
 * @param hooks - Optional hooks to handle the status changes and errors.
 *
 * @returns {Array} An array containing:
 * - `setting`: The current setting value or undefined.
 * - `setSetting`: A function to update the setting.
 *
 * @example
 * const { setting, setSetting } = useAppSetting('theme');
 *
 * @example
 * // with default value
 * const { setting, setSetting } = useAppSetting('theme', 'dark');
 *
 * @example
 * // with hooks
 * const [isLoading, setIsLoading] = useState(false);
 * const [isUpdating, setIsUpdating] = useState(false);
 * const [error, setError] = useState<Error | null>(null);
 *
 * const { setting, setSetting } = useAppSetting('theme', 'dark', {
 *    onLoading: setIsLoading,
 *    onUpdating: setIsUpdating,
 *    onError: setError,
 *    onUpdated: useCallback(() => console.log('Settings updated'), [])
 * });
 */
export const useAppSetting = <
    TSettings extends Record<string, unknown> = AppSettings,
    TProp extends keyof TSettings = keyof TSettings,
>(
    prop: TProp,
    defaultSettings?: TSettings[TProp],
    hooks?: AppSettingsStatusHooks & {
        onError?: (error: Error | null) => void;
        onUpdated?: () => void;
    },
): [TSettings[TProp] | undefined, (settings: TSettings[TProp]) => void] => {
    const [{ onError, onUpdated, onLoading, onUpdating }] = useState(() => hooks ?? {});

    const { currentApp = null } = useCurrentApp();

    // subscribe to the setting value
    const { value: setting } = useObservableState(
        useMemo(
            () =>
                currentApp?.settings$.pipe(
                    map((settings) => (settings as TSettings)[prop]),
                ) as Observable<TSettings[TProp]>,
            [currentApp, prop],
        ),
        { initial: defaultSettings },
    );

    // update function
    const setSetting = useCallback(
        (value: TSettings[TProp]) => {
            if (!currentApp) {
                return onError?.(new Error('App is not available'));
            }
            currentApp.updateSetting<TSettings, TProp>(prop, value).subscribe({
                error: onError,
                complete: onUpdated,
            });
        },
        [currentApp, prop, onError, onUpdated],
    );

    // status hooks
    useAppSettingsStatus(currentApp, {
        onLoading,
        onUpdating,
    });

    return [setting, setSetting];
};

export default useAppSetting;
