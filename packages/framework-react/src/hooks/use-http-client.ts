import { useFramework } from './use-framework';

type FrameworkHttpClient = 'portal';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useHttpClient = (name: FrameworkHttpClient) => {
    const framework = useFramework();
    if (framework.modules.http.hasClient(name)) {
        return framework.modules.http.createClient(name);
    }
    throw Error(`no configured client for key [${name}]`);
};
