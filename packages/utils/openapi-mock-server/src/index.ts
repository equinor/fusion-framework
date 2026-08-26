/**
 * Standalone HTTP server for `@equinor/fusion-openapi-mock`, serving every
 * service discovered from a directory of OpenAPI specs at its own address —
 * so a test runner (e.g. Playwright) can point service discovery at one
 * origin and drive per-test overrides directly over HTTP.
 *
 * @remarks
 * This entry point covers everyday use: `createMockServer()` plus its
 * options and handle types. `discoverServices`/`loadOpenApiDocument`/
 * `mergeServiceDefinitions`/`createRouter` live under `./discovery`, and the
 * bundled Fusion baseline under `./presets`/`./presets/fusion` — import
 * those subpaths directly instead of pulling them in here unused.
 *
 * @packageDocumentation
 */

export {
  createMockServer,
  type CreateMockServerOptions,
  type MockOverride,
  type MockServerHandle,
  type MockSource,
  type ServiceDiscoveryEntry,
  type StartOptions,
} from './server/index.js';
