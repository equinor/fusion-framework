import { useCallback, useLayoutEffect, useMemo } from 'react';
import { BehaviorSubject, type Observable } from 'rxjs';

import type { AppSettings } from '@equinor/fusion-framework-module-app';

import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { useObservableState } from '@equinor/fusion-observable/react';

import { useAppSettingsStatus, type AppSettingsStatusHooks } from './useAppSettingsStatus';

type UpdateSettingsFunction<T, O = T> = (currentSettings: T | undefined) => O;

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
): [TSettings, (settings: TSettings | UpdateSettingsFunction<TSettings>) => void] => {
  const { onError, onUpdated, onLoading, onUpdating } = hooks ?? {};
  const { currentApp = null } = useCurrentApp();

  // biome-ignore lint/correctness/useExhaustiveDependencies: create new subject when app changes
  const subject = useMemo(() => {
    return new BehaviorSubject<TSettings>(defaultValue ?? ({} as TSettings));
  }, [currentApp]);

  // connect the subject to the current app settings stream
  useLayoutEffect(() => {
    const sub = (currentApp?.settings$ as Observable<TSettings>).subscribe(subject);
    return () => sub?.unsubscribe();
  }, [currentApp, subject]);

  // subscribe to the subject to get the latest settings
  const { value: settings } = useObservableState(subject, { initial: defaultValue });

  const setSettings = useCallback(
    (update: TSettings | UpdateSettingsFunction<TSettings>) => {
      if (!currentApp) {
        return onError?.(new Error('App is not available'));
      }

      // resolve settings with the provided value or function
      const settings = typeof update === 'function' ? update(subject.value) : update;

      currentApp.updateSettings(settings).subscribe({
        next: () => {
          onUpdated?.();
          onError?.(null);
        },
        error: onError,
      });
    },
    [currentApp, subject, onError, onUpdated],
  );

  useAppSettingsStatus(currentApp, { onLoading, onUpdating });

  return [settings, setSettings];
};

export default useAppSettings;
