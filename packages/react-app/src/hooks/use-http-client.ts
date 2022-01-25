/* eslint-disable @typescript-eslint/ban-types */
import { useMemo } from 'react';
import { useModuleContext } from '../modules';

type OtherString = string & {};
export type AppHttpClient = '';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useHttpClient = (name: AppHttpClient | OtherString) => {
    const module = useModuleContext();
    const client = useMemo(() => {
        if (module.http.hasClient(name)) {
            return module.http.createClient(name);
        }
        throw Error(`no configured client for key [${name}]`);
    }, [name]);
    // TODO - abort on unmount?
    return client;
};

export default useHttpClient;
