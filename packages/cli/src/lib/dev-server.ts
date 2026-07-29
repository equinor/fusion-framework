/**
 * Dev-server re-exports for `@equinor/fusion-framework-cli/dev-server`.
 *
 * Aggregates service processing, configuration loading/merging, and type
 * definitions used when working with the Fusion dev server.
 *
 * @packageDocumentation
 */
export { processServices } from '@equinor/fusion-framework-dev-server';
export {
  defineDevServerConfig,
  type DevServerConfigFn,
  type DevServerConfigExport,
} from './define-dev-server-config.js';
export { loadDevServerConfig } from './load-dev-server-config.js';

export { mergeDevServerConfig } from './merge-dev-server-config.js';
