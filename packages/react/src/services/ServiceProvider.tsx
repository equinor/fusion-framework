import { createContext, useContext } from 'react';

import { Services } from '@equinor/fusion-framework/services';

const context = createContext<Services | null>(null);
const { Provider } = context;

export const useServices = (): Services => {
    const services = useContext(context) as Services;
    if (!services) {
        throw Error('No service context found, make sure hook is called within service provider!');
    }
    return services;
};

export type FusionServiceProviderProps = {
    services: Services;
};

export const FusionServiceProvider = (
    args: React.PropsWithChildren<FusionServiceProviderProps>
): JSX.Element => {
    const { services, children } = args;
    return <Provider value={services}>{children}</Provider>;
};

export default FusionServiceProvider;
