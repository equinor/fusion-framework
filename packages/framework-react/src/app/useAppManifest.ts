import { useEffect, useState } from 'react';
import { AppManifest } from '@equinor/fusion-framework-module-app';
import { useFramework } from '../useFramework';

export const useAppManifest = (appKey: string) => {
    const provider = useFramework().modules.app;
    const [value, setValue] = useState<AppManifest | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const request = provider.getAppManifest(appKey).subscribe({
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

export default useAppManifest;
