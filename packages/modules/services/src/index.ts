/**
 * @packageDocumentation
 *
 * Typed API service clients for the Fusion Framework.\
 * Provides factory-based access to bookmarks, context, notification, and
 * people APIs with versioned endpoints, response validation, and support
 * for both promise (`json`) and observable (`json$`) consumption patterns.
 *
 * @example
 * ```ts
 * import { enableServices } from '@equinor/fusion-framework-module-services';
 * configurator.addConfig(enableServices);
 * ```
 */

export * from './types.js';
export type { ServicesModule, ServicesModuleKey } from './module.js';

export { ApiConfigurator, IApiConfigurator } from './configurator.js';
export { ApiProvider, IApiProvider } from './provider.js';
export { default, module, enableServices, configureServices } from './module.js';
