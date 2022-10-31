import { AppManifest } from '@equinor/fusion-framework-module-app';
import { useEffect, useState } from 'react';
import { useFramework } from '../hooks';

export const useApps = () => {
    const provider = useFramework().modules.app;
    const [value, setValue] = useState<AppManifest[] | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        const request = provider.getAllApps().subscribe({
            next: (value) => setValue(value),
            error: (err) => setError(err),
            complete: () => setIsLoading(false),
        });
        return () => {
            setIsLoading(false);
            request.unsubscribe();
        };
    }, [provider, setValue, setError, setIsLoading]);
    return { value, error, isLoading };
};

export default useApps;
