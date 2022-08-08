import { useEffect } from 'react';

import { useModule } from '@equinor/fusion-framework-react-module';

import { appConfigModuleKey } from '@equinor/fusion-framework-module-app-config';
import type { AppConfig, IAppConfigProvider } from '@equinor/fusion-framework-module-app-config';

import { useQueryClient$, useQueryClientStreamResult } from '@equinor/fusion-observable/react';
import type {
    UseQueryClientResult,
    UseQueryClientStreamResult,
} from '@equinor/fusion-observable/react';

export type UseAppConfigQueryArgs = { appKey: string; tag?: string };

export type UseAppConfigStreamResult<T> = Omit<
    UseQueryClientStreamResult<AppConfig<T>, UseAppConfigQueryArgs>,
    'query'
>;

export type UseAppConfigResult<T> = Omit<
    UseQueryClientResult<AppConfig<T>, UseAppConfigQueryArgs>,
    'query'
>;

export type AppConfigProps<T> = UseAppConfigQueryArgs & {
    initial?: AppConfig<T>;
};

/**
 * Observable app config query
 * @see `@equinor/fusion-observable.useQueryClient$`
 */
export const useAppConfig$ = <T>(props: AppConfigProps<T>): UseAppConfigStreamResult<T> => {
    const module = useModule<{ [appConfigModuleKey]: IAppConfigProvider }>('appConfig');
    if (!module) {
        throw Error('app config module is not initiated in scope!');
    }
    const { appKey, tag, initial } = props;
    const { query, ...result } = useQueryClient$<AppConfig<T>, UseAppConfigQueryArgs>(
        (args) => module.getConfig(args.appKey, args.tag),
        { initial }
    );
    useEffect(() => {
        query({ appKey, tag });
    }, [appKey, tag, query]);
    return result;
};

export const useAppConfig = <T>(props: AppConfigProps<T>): UseAppConfigResult<T> => {
    return useQueryClientStreamResult(useAppConfig$(props));
};
