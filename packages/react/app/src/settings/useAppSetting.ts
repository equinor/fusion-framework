/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { EMPTY, from, lastValueFrom, type Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import type { DotPath, DotPathType } from './dot-path';
import { type AppSettings } from '@equinor/fusion-framework-module-app';

function getByDotPath<T extends Record<string, any>>(
    obj: T,
    path: DotPath<T>,
): DotPathType<T, string> {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) as DotPathType<T, string>;
}

function setByDotPath<T extends Record<string, any>, TProp extends DotPath<T>>(
    obj: T,
    path: TProp,
    value: DotPathType<T, TProp>,
): T {
    // Split the property path into individual parts
    const props = typeof path === 'string' ? path.split('.') : path;

    // Get the first property in the path
    const prop = props.shift();

    // If there is a property to process
    if (prop) {
        // Create the nested object if it doesn't exist
        if (!obj[prop]) {
            (obj as any)[prop] = {};
        }

        // If there are more properties in the path, recurse
        props.length
            ? setByDotPath(obj[prop] as Record<string, unknown>, props.join('.'), value)
            : Object.assign(obj, { [prop]: value });
    }

    // Return the modified object
    return obj as T;
}

/**
 * Hook for handling a users app settings
 * @returns {settings, updateSettings} Methods for getting and setting settings.
 */
export const useAppSetting = <
    TSettings extends Record<string, any> = AppSettings,
    TProp extends DotPath<TSettings> = TSettings[keyof TSettings],
>(
    prop: TProp,
): {
    setting: DotPathType<TSettings, TProp> | undefined;
    updateSettings: (value: DotPathType<TSettings, TProp>) => void;
} => {
    const { currentApp } = useCurrentApp();

    const selector = useMemo(() => {
        return map((settings: TSettings) => getByDotPath(settings, prop));
    }, [prop]);

    const { value: setting } = useObservableState<DotPathType<TSettings, TProp>>(
        useMemo(
            () => (currentApp?.settings$ as Observable<TSettings>).pipe(selector) || EMPTY,
            [currentApp, selector],
        ),
    );

    const updateSettings = useCallback(
        async (value: DotPathType<TSettings, TProp>) => {
            const newSettings = await lastValueFrom(
                from(value).pipe(
                    withLatestFrom(currentApp?.settings$ || EMPTY),
                    map(([value, settings]) => {
                        return setByDotPath(settings, prop, value as DotPathType<TSettings, TProp>);
                    }),
                ),
            );
            currentApp?.updateSettings(newSettings);
        },
        [currentApp, prop],
    );

    return {
        setting,
        updateSettings,
    };
};

export default useAppSetting;
