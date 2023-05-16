import { useMemo } from 'react';
import useCurrentApp from './useCurrentApp';

import { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import { Observable, of } from 'rxjs';
import { type AnyModule } from '@equinor/fusion-framework-module';

/**
 * Observers the stream of current app initialized modules
 *
 * __Warning:__ type hint templates are only hints, this does not check if the modules are actually enabled!
 *
 * @template TModule type hint modules which the application has configured
 * @returns the observable instance of initialized modules of the application
 */
export const useCurrentAppModules = <TModules extends Array<AnyModule> = []>(): {
    modules$: Observable<AppModulesInstance<TModules> | null>;
    error?: unknown;
} => {
    const { currentApp, error } = useCurrentApp<TModules>();
    const modules$ = useMemo(
        () =>
            currentApp
                ? (currentApp.instance$ as Observable<AppModulesInstance<TModules>>)
                : of(null),
        [currentApp]
    );
    return {
        modules$,
        error,
    };
};

export default useCurrentAppModules;
