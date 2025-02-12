export {
    module,
    configureMsal,
    enableMSAL,
    type AuthConfigurator as IAppConfigurator,
    type AuthConfigFn,
    type IAuthProvider,
    type MsalModule,
} from './module';

export { MsalModuleVersion } from './static';

export { default } from './module';

export type { AccountInfo, AuthenticationResult } from './v2/types';
export type { AuthClientConfig } from './v2/configurator';
