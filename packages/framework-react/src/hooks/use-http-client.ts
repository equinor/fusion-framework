import { useMemo } from 'react';
import { Fusion } from '@equinor/fusion-framework';
import { useFramework } from '../useFramework';

type HttpClient = ReturnType<Fusion['modules']['http']['createClient']>;
type FrameworkHttpClient = 'portal';

export const useHttpClient = (name: FrameworkHttpClient): HttpClient => {
    const framework = useFramework();

    const client = useMemo(() => {
        if (framework.modules.http.hasClient(name)) {
            return framework.modules.http.createClient(name);
        }
        throw Error(`no configured client for key [${name}]`);
    }, [name]);
    // TODO - abort on unmount?
    return client;
};
