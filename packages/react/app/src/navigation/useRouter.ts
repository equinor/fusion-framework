import { useMemo } from 'react';
import { useNavigationModule } from './useNavigationModule';
import { type INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * create a router for react routing
 * @see {@link [docs](https://equinor.github.io/fusion-framework/modules/navigation/)}
 * @see {@link [react-router](https://reactrouter.com/en/main/routers/create-browser-router)}
 * @param routes router objects __(must be static | memorized)__
 */
export const useRouter = (
    routes: Parameters<INavigationProvider['createRouter']>[0]
): ReturnType<INavigationProvider['createRouter']> => {
    const provider = useNavigationModule();
    return useMemo(() => provider.createRouter(routes), [provider, routes]);
};
