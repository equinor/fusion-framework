import { useCallback, useMemo } from 'react';
import { type AppSettings } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { EMPTY, Observable, Subject } from 'rxjs';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';

/**
 * Custom hook to manage application settings.
 *
 * @template TSettings - The type of the settings object, extending Record<string, any>. Defaults to AppSettings.
 *
 * @param {TSettings} [defaultValue] - The default value for the settings.
 *
 * @note
 * `defaultValue` will only be used on the first render.
 *
 * @returns {Object} An object containing:
 * - `settings`: The current settings or undefined.
 * - `setSettings`: A function to update the settings.
 *
 * @example
 * const { settings, setSettings } = useAppSettings();
 *
 * @example
 * const { settings, setSettings } = useAppSettings({ theme: 'dark' });
 */
export const useAppSettings = <TSettings extends Record<string, unknown> = AppSettings>(
    defaultValue?: TSettings,
): {
    settings: TSettings | undefined;
    setSettings: (settings: TSettings) => void;
} => {
    const { currentApp } = useCurrentApp();

    const subject = useMemo(() => {
        const subject = new Subject<TSettings | undefined>();
        ((currentApp?.settings$ || EMPTY) as Observable<TSettings>).subscribe(subject);
        return subject;
    }, [currentApp]);

    const { value: settings } = useObservableState(subject, { initial: defaultValue });

    const setSettings = useCallback(
        (settings: AppSettings) => {
            currentApp?.updateSettings(settings).subscribe({
                next: () => subject.next(settings as TSettings),
            });
        },
        [currentApp, subject],
    );

    return { settings, setSettings };
};

export default useAppSettings;
