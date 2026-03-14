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

export * from './types';
export type { ServicesModule, ServicesModuleKey } from './module';

export { ApiConfigurator, IApiConfigurator } from './configurator';
export { ApiProvider, IApiProvider } from './provider';
export { default, module, enableServices, configureServices } from './module';
