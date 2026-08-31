/**
 * Zero-configuration application module pipelines for tests.
 *
 * @remarks
 * Lets a test initialize an application's real module pipeline — real
 * `event`/`http`/`msal` modules, real configuration pipeline, real lifecycle —
 * while the boundaries that reach outside the process are substituted with the
 * same deterministic fakes {@link https://www.npmjs.com/package/@equinor/fusion-framework | @equinor/fusion-framework}'s
 * own `/mock` entry point uses. No credentials, no network access and no
 * running parent portal are required.
 *
 * This entry point is test-runner agnostic: it contains no dependency on
 * Vitest or any other test framework, so the same helpers work under any
 * runner.
 *
 * @packageDocumentation
 */

export { mockAppModules, type AppMockConfigureFn } from './mock-app-modules.js';
export { AppMockConfigurator } from './AppMockConfigurator.js';
export { enableAppManifestMock } from './enable-app-manifest-mock.js';
