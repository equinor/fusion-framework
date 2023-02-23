/**
 * [[include:module-http/README.MD]]
 * @module
 */

export * from './configurator';
export * from './provider';
export * from './module';

export * from './errors';

export type { IHttpClient, FetchResponse } from './lib/client';

export { default } from './module';
