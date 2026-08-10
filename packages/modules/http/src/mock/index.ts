/**
 * Testing utilities for the HTTP module.
 *
 * @remarks
 * Imported from `@equinor/fusion-framework-module-http/mock`, so testing
 * utilities ship and version with the implementation they stand in for.
 *
 * There is no separate mock client or configurator here — register a
 * short-circuiting `HttpMiddleware` through `configurator.http.addMiddleware(...)`
 * on the real `HttpClientConfigurator` instead, so app config never has to
 * branch on whether it's under test. See {@link createOpenApiMockMiddleware}
 * for faking a whole OpenAPI document's operations that way.
 *
 * This entry point has no dependency on any test runner.
 *
 * @packageDocumentation
 */

export { createOpenApiMockMiddleware, type OpenApiMockLike } from './adapters';
export {
  createRouterMiddleware,
  type MockRouteHandler,
  type MockRouteMatch,
  type IMockRouterBuilder,
} from './adapters';
