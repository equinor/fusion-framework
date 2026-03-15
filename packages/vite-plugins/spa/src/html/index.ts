/**
 * Public API surface of the `@equinor/fusion-framework-vite-plugin-spa/html`
 * sub-path export.
 *
 * @remarks
 * Re-exports the {@link registerServiceWorker} function so that custom
 * bootstrap files can register the SPA service worker without importing
 * internal paths.
 */
export { registerServiceWorker } from './register-service-worker.js';
