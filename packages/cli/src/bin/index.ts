/**
 * Binary / command-handler API for `@equinor/fusion-framework-cli/bin`.
 *
 * Exports the programmatic entry points for every CLI operation —
 * build, pack, upload, publish, tag, dev-server, and framework
 * initialisation — so they can be consumed by both the CLI and
 * third-party automation scripts.
 *
 * @packageDocumentation
 */
export { buildApplication } from './build-application.js';
export { bundleApp } from './bundle-app.js';
export { generateApplicationConfig } from './generate-application-config.js';
export { publishAppConfig } from './publish-app-config.js';
export { startAppDevServer } from './start-app-dev-server.js';
export { serveApplication, type ServeApplicationOptions } from './serve-application.js';
export { checkApp } from './check-app.js';
export { loadAppManifest } from './load-app-manifest.js';
export { uploadApplication } from './upload-application.js';
export { tagApplication } from './tag-application.js';
export { testApplication, type TestApplicationOptions } from './test-application.js';

export { startPortalDevServer } from './start-portal-dev-server.js';
export { servePortal, type ServePortalOptions } from './serve-portal.js';
export { buildPortal } from './build-portal.js';
export { bundlePortal } from './bundle-portal.js';
export { loadPortalManifest } from './load-portal-manifest.js';
export { generatePortalConfig } from './generate-portal-config.js';
export { publishPortalConfig } from './publish-portal-config.js';
export { uploadPortalBundle, type UploadPortalOptions } from './upload-portal-bundle.js';
export { tagPortal } from './tag-portal.js';

export { pack } from './pack.js';

export { ConsoleLogger } from './utils/ConsoleLogger.js';

export {
  type FusionFramework,
  FusionEnv,
} from './fusion-env.js';
export { configureFramework, type FusionFrameworkSettings } from './configure-framework.js';
export { resolveDefaultEnv } from './resolve-default-env.js';
export { initializeFramework } from './initialize-framework.js';
