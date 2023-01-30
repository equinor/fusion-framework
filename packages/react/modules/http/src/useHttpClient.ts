/* eslint-disable @typescript-eslint/ban-types */
import { useMemo } from 'react';

import type { HttpMsalModule, IHttpClient } from '@equinor/fusion-framework-module-http';

import { useModule } from '@equinor/fusion-framework-react-module';

/**
 * Use a configured client from application modules
 *
 * creates a new client from configured client by name and memorizes the instance.
 * if provided name changes a new client will be created
 *
 * @see {@link IHttpClient}
 * @see {@link @equinor/fusion-framework-module-http.IHttpClientConfigurator.configureClient|configureClient}
 * @template TType type-hint return type, useful if custom Ctor is provided in config
 * @param name Named client from configuration
 */
export const useHttpClient = (name: string): IHttpClient => {
    const http = useModule<HttpMsalModule>('http');
    const client = useMemo(() => {
        if (http.hasClient(name)) {
            return http.createClient(name);
        }
        throw Error(`no configured client for key [${name}]`);
    }, [http, name]);
    // TODO - abort on unmount?
    return client;
};

export default useHttpClient;
