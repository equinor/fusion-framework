import { useEffect, useState } from 'react';

import { useAppModules } from '@equinor/fusion-framework-react-app';
import { ClientMethodType, ServicesModule } from '@equinor/fusion-framework-module-services';
import BookmarksApiClient from '@equinor/fusion-framework-module-services/bookmarks/index';
import { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useBookmarksClient = <TMethod extends ClientMethodType, TPayload = unknown>(
    type: TMethod
) => {
    const [client, setClient] = useState<BookmarksApiClient<TMethod, IHttpClient, TPayload> | null>(
        null
    );

    const modules = useAppModules<[ServicesModule]>();

    useEffect(() => {
        modules.services.createBookmarksClient<TMethod, TPayload>(type).then(setClient);
    }, [modules.services, setClient, type]);

    return client;
};
