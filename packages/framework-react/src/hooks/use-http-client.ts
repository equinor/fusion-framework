import { useFramework } from './use-framework';

import { Fusion } from '@equinor/fusion-framework';

type HttpClient = ReturnType<Fusion['modules']['http']['createClient']>;
type FrameworkHttpClient = 'portal';

export const useHttpClient = (name: FrameworkHttpClient): HttpClient => {
    const framework = useFramework();
    if (framework.modules.http.hasClient(name)) {
        return framework.modules.http.createClient(name);
    }
    throw Error(`no configured client for key [${name}]`);
};
