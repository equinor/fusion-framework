import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { BehaviorSubject, map } from 'rxjs';

import { useCurrentApp } from '@equinor/fusion-framework-react/app';

import { useAppSettingsStatus, type AppSettingsStatusHooks } from './useAppSettingsStatus';

import type { AppSettings } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';

type UpdateSettingFunction<T, O = T> = (currentSetting: T | undefined) => O;

/**
 * Custom hook to manage application settings.
 *
 * @template TSettings - The type of the settings object. Defaults to `AppSettings`.
 * @template TProp - The type of the property key in the settings object. Defaults to `keyof TSettings`.
 *
 * @param {TProp} prop - The property key in the settings object to manage.
 * @param {TSettings[TProp]} [defaultValue] - The default value for the setting.
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
  defaultValue?: TSettings[TProp],
  hooks?: AppSettingsStatusHooks & {
    onError?: (error: Error | null) => void;
    onUpdated?: () => void;
  },
): [
  TSettings[TProp] | undefined,
  (update: TSettings[TProp] | UpdateSettingFunction<TSettings[TProp]>) => void,
] => {
  const [{ onError, onUpdated, onLoading, onUpdating }] = useState(() => hooks ?? {});

  const { currentApp = null } = useCurrentApp();

  // create a subject to manage the setting value
  // biome-ignore lint/correctness/useExhaustiveDependencies: new subject when app changes
  const subject = useMemo(() => {
    return new BehaviorSubject<TSettings[TProp] | undefined>(defaultValue);
  }, [currentApp]);

  useLayoutEffect(() => {
    const sub = currentApp?.settings$
      .pipe(map((settings) => (settings as TSettings)[prop]))
      .subscribe(subject);
    return () => sub?.unsubscribe();
  }, [currentApp, subject, prop]);

  // subscribe to the setting value
  const { value: setting } = useObservableState(subject);

  // update function
  const setSetting = useCallback(
    (update: TSettings[TProp] | UpdateSettingFunction<TSettings[TProp]>) => {
      if (!currentApp) {
        return onError?.(new Error('App is not available'));
      }

      // resolve setting value with the provided value or function
      const value =
        typeof update === 'function'
          ? (update as UpdateSettingFunction<TSettings[TProp]>)(subject.value)
          : update;

      currentApp.updateSetting<TSettings, TProp>(prop, value).subscribe({
        error: onError,
        complete: onUpdated,
      });
    },
    [currentApp, subject, prop, onError, onUpdated],
  );

  // status hooks
  useAppSettingsStatus(currentApp, {
    onLoading,
    onUpdating,
  });

  return [setting, setSetting];
};

export default useAppSetting;
