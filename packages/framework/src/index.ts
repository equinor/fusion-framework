import { BehaviorSubject } from 'rxjs';
import configureServices, { Services, ServiceInitiator } from './services';

interface Api extends Services {
    currentApp: Services;
    registerApp: (app: string, appInit: ServiceInitiator) => Promise<void>;
}

export const createInstance = async (init: ServiceInitiator): Promise<Api> => {
    const app$ = new BehaviorSubject<Record<string, Services>>({});
    const rootConfig = await configureServices();
    const rootServices = await rootConfig(init);

    // TODO move insto services;
    const registerApp = async (app: string, appInit: ServiceInitiator) => {
        const appConfig = await configureServices(rootServices);
        const appServices = await appConfig(appInit);
        app$.next({ ...app$.value, [app]: appServices });
    };

    return {
        // TODO
        get currentApp(): Services {
            return Object.values(app$.value)[0];
        },
        registerApp,
        ...rootServices,
    };
};

// TODO
export { AuthClient, createAuthClient } from '@equinor/fusion-web-msal';

export default createInstance;
