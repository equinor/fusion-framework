import { ApiClientFactory } from './types';

export interface IApiConfigurator {
    /** Method for creating IHttpClients */
    createClient?: ApiClientFactory;
}

export class ApiConfigurator implements IApiConfigurator {}
