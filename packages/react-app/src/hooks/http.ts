/* eslint-disable @typescript-eslint/ban-types */
import { HttpClientMsal, IHttpClient } from '@equinor/fusion-framework-module-http';
import { useMemo } from 'react';
import { useModuleContext } from '../modules';

type OtherString = string & {};
export type AppHttpClient = '';

export { IHttpClient, HttpClientMsal };

export const useHttpClient = <TType extends IHttpClient = HttpClientMsal>(
    name: AppHttpClient | OtherString
): TType => {
    const module = useModuleContext();
    const client = useMemo(() => {
        if (module.http.hasClient(name)) {
            return module.http.createClient(name);
        }
        throw Error(`no configured client for key [${name}]`);
    }, [name]);
    // TODO - abort on unmount?
    return client as unknown as TType;
};

export default useHttpClient;
