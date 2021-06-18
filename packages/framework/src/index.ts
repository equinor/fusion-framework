import configureServices, { Services, ServiceInitiator } from './services';

// TODO
export { AuthClient, createAuthClient } from '@equinor/fusion-web-msal';

/**
 *  Base api instance, internal for provider (portal)
 */
export interface ApiInstance {
    services: Services;
}

// TODO make interface with intelisense
export interface FusionService extends Services {}

/**
 * Public interface of fusion api, normally exposed on window
 */
export interface Fusion {
    /**
     * Configured services for Fusion
     */
    services: FusionService;
    /**
     * Create a scoped instance of services
     */
    createServiceInstance: (cb: ServiceInitiator) => Promise<Services>;
}

export interface ApplicationApi {
    services: Services;
}

export interface ApplicationManifest {}

export interface ApplicationRenderer {
    (fusion: Fusion, env: ApplicationManifest):
        | ((element: HTMLElement) => void)
        | Promise<(element: HTMLElement) => void>;
}

export const createApi = async (init: ServiceInitiator): Promise<ApiInstance> => {
    const services = await (await configureServices())(init);
    return { services };
};

export const createFusion = (api: ApiInstance): Fusion => {
    const { services } = api;
    const createServiceInstance = async (cb: ServiceInitiator): Promise<Services> =>
        (await configureServices(api.services))(cb);
    return {
        services,
        createServiceInstance,
    };
};

// TODO api service enpoint list
export const initFusion = async (init: ServiceInitiator): Promise<ApiInstance> => {
    const api = await createApi(init);
    window.Fusion = createFusion(api);
    return api;
};

declare global {
    interface Window {
        Fusion: Fusion;
    }
}

export default initFusion;
