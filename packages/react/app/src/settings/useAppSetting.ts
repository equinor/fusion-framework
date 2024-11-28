import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { EMPTY, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { type AppSettings } from '@equinor/fusion-framework-module-app';

/**
 * Custom hook to manage application settings.
 *
 * @template TSettings - The type of the settings object. Defaults to `AppSettings`.
 * @template TProp - The type of the property key in the settings object. Defaults to `keyof TSettings`.
 *
 * @param {TProp} prop - The property key in the settings object to manage.
 * @param {TSettings[TProp]} [defaultValue] - The default value for the setting.
 *
 * @returns {object} An object containing:
 * - `setting`: The current value of the setting.
 * - `setSetting`: A function to update the setting value.
 *
 * @example
 * const { setting, setSetting } = useAppSetting('theme');
 *
 * @example
 * // with default value
 * const { setting, setSetting } = useAppSetting('theme', 'dark');
 */
export const useAppSetting = <
    TSettings extends Record<string, unknown> = AppSettings,
    TProp extends keyof TSettings = keyof TSettings,
>(
    prop: TProp,
    defaultValue?: TSettings[TProp],
): {
    setting: TSettings[TProp] | undefined;
    setSetting: (value: TSettings[TProp]) => void;
} => {
    const { currentApp } = useCurrentApp();

    const subject = useMemo(() => {
        const subject = new Subject<TSettings[TProp]>();
        (currentApp?.settings$ || EMPTY)
            .pipe(map((settings) => (settings as TSettings)[prop]))
            .subscribe(subject);
        return subject;
    }, [currentApp, prop]);

    const { value: setting } = useObservableState(subject, { initial: defaultValue });

    const setSetting = useCallback(
        (value: TSettings[TProp]) => {
            currentApp?.updateSetting(prop as string, value).subscribe({
                next: () => subject.next(value),
            });
        },
        [currentApp, prop, subject],
    );

    return { setting, setSetting };
};

export default useAppSetting;
