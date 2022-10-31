import { useEffect, useState } from 'react';
import { AppConfig } from '@equinor/fusion-framework-module-app';

import { useFramework } from '../hooks';

type UseAppConfigState<TType> = {
    value?: AppConfig<TType>;
    error?: Error;
    isLoading: boolean;
};

export const useAppConfig = <TType>(args: {
    appKey: string | undefined;
}): UseAppConfigState<TType> => {
    const { appKey } = args;
    const provider = useFramework().modules.app;
    const [value, setValue] = useState<AppConfig<TType> | undefined>();
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setValue(undefined);
    }, [setValue, appKey]);

    useEffect(() => {
        if (!appKey) {
            return;
        }
        setIsLoading(true);
        const request = provider.getAppConfig<TType>(appKey).subscribe({
            next: (value) => setValue(value),
            error: (err) => setError(err),
            complete: () => setIsLoading(false),
        });
        return () => {
            setIsLoading(false);
            request.unsubscribe();
        };
    }, [provider, setValue, setError, setIsLoading, appKey]);
    return { value, error, isLoading };
};

export default useAppConfig;
