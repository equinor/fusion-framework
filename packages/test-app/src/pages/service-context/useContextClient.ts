import { useEffect, useState } from 'react';

import { useAppModules } from '@equinor/fusion-framework-react-app';
import { ContextApiClient } from '@equinor/fusion-framework-module-services/context';
import {
    Service,
    ClientMethodType,
    ServicesModule,
} from '@equinor/fusion-framework-module-services';

export const useContextClient = <T extends ClientMethodType>(
    type: T
): ContextApiClient<T> | null => {
    const [client, setClient] = useState<ContextApiClient<T> | null>(null);

    const modules = useAppModules<[ServicesModule]>();

    useEffect(() => {
        modules.services.createApiClient(Service.Context, type).then(setClient);
    }, [modules.services, setClient, type]);

    return client;
};
