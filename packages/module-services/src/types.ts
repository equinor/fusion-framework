import { IHttpClient } from '@equinor/fusion-framework-module-http';

export type ApiClientFactory = (name: string) => Promise<IHttpClient>;
