import { ApiClientFactory } from './types';

export interface IApiConfigurator {
    createClient?: ApiClientFactory;
}

export class ApiConfigurator implements IApiConfigurator {}
