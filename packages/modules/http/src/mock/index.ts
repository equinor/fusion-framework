/**
 * Test doubles for the HTTP module.
 *
 * @remarks
 * Imported from `@equinor/fusion-framework-module-http/mock`, so the mock ships
 * and versions with the implementation it stands in for.
 *
 * The mock replaces only the network call each client makes — everything
 * around it (request preparation, MSAL scope handling, the response
 * pipeline) is the real `HttpClientMsal`, so a test still exercises how the
 * application builds and uses its clients, not just canned data.
 *
 * This entry point has no dependency on any test runner.
 *
 * @packageDocumentation
 */

export { HttpMockRouter, type HttpMockMiddleware } from './HttpMockRouter';
export { createHttpClientMockCtor } from './create-http-client-mock-ctor';
export { HttpMockConfigurator } from './HttpMockConfigurator';
export { enableHttpMock, httpMockModule, type HttpConfigMockFn } from './module';
export {
  fromExpressStyleHandler,
  type ExpressStyleRequest,
  MockExpressResponse,
  type ExpressStyleResponse,
  fromOpenApiMock,
  type OpenApiMockLike,
} from './adapters';
