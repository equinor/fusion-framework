import { useEffect, useMemo, useState } from 'react';

import { useModule } from '@equinor/fusion-framework-react-module';

import type { AppConfig, AppConfigModule } from '@equinor/fusion-framework-module-app-config';

import { Query } from '@equinor/fusion-observable/query';

export type UseAppConfigQueryArgs = { appKey: string; tag?: string };

export type AppConfigProps<T> = UseAppConfigQueryArgs & {
    initial?: AppConfig<T>;
};

export type UseAppConfigResult<T> = {
    value: AppConfig<T> | undefined;
};

export const useAppConfig = <T>(props: AppConfigProps<T>): UseAppConfigResult<T> => {
    const module = useModule<AppConfigModule>('appConfig');
    if (!module) {
        throw Error('app config module is not initiated in scope!');
    }
    const { appKey, tag, initial } = props;

    const client = useMemo(
        () =>
            new Query<AppConfig<T>, UseAppConfigQueryArgs>({
                key: (args) => JSON.stringify(args),
                client: {
                    fn: (args) => module.getConfig(args.appKey, args.tag),
                },
            }),
        [module.getConfig]
    );

    const [value, setValue] = useState<AppConfig<T> | undefined>(initial);

    useEffect(() => {
        const subscription = client.query({ appKey, tag }).subscribe((x) => setValue(x.value));
        return () => subscription.unsubscribe();
    }, [appKey, tag, client]);

    return { value };
};
