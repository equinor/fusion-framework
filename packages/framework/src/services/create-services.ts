import { ServiceConfig, ServiceInitiator, Services } from './types';

import configureHttp from './config.http';
import configureAuth from './config.auth';

export const createServices = async (
    services?: Services
): Promise<(cb: ServiceInitiator) => Promise<Services>> => {
    const config = {};
    const build = {
        auth: configureAuth(config, services),
        http: configureHttp(config, services),
    };
    return async (init: (config: ServiceConfig) => void): Promise<Services> => {
        await Promise.resolve(init(config as ServiceConfig));
        const instance = await Object.keys(build).reduce(async (acc, key) => {
            const obj = await acc;
            const provider = await Promise.resolve(build[key as keyof typeof build](obj));
            return Object.assign(obj, provider);
        }, Promise.resolve({}));
        Object.seal(instance);
        return instance as Services;
    };
};

export default createServices;
