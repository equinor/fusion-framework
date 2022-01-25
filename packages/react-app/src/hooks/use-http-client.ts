/* eslint-disable @typescript-eslint/ban-types */
import { useModuleContext } from '../modules';

type OtherString = string & {};
export type AppHttpClient = 'my-client';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useHttpClient = (name: AppHttpClient | OtherString) => {
    const module = useModuleContext();
    if (module.http.hasClient(name)) {
        return module.http.createClient(name);
    }
    throw Error(`no configured client for key [${name}]`);
};

// export const useHttpClient = (
//     client: AppHttpClient | FrameworkHttpClient | OtherString
// ): IHttpClient => {
//     const framework = useFramework();
//     const module = useModuleContext();
//     if (module.http.hasClient(client)) {
//         return module.http.createClient(client);
//     }
//     if (framework.modules.http.hasClient(client)) {
//         return framework.modules.http.createClient(client);
//     }
//     throw Error(`no configured client for key [${client}]`);
// };

export default useHttpClient;
