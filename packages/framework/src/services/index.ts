export type { Services, ServiceInitiator, ServiceConfig } from './types';
export { createServices } from './create-services';
export { default } from './create-services';

export { HttpClientMsal, HttpClient } from './http';
export type { HttpClientMsal as FusionClient } from './http';

// TODO remove this later
export { createAuthClient } from '@equinor/fusion-web-msal';
