/**
 * @module @equinor/fusion-framework-vite-plugin-api-service
 *
 * Vite plugin for proxying service discovery requests and mocking API
 * endpoints during Fusion Framework application development.
 *
 * Use this plugin to:
 * - proxy requests to a service discovery endpoint and remap service URLs
 *   to local routes the dev-server can manage
 * - define custom middleware routes that return mocked responses
 * - intercept and transform proxy responses before they reach the client
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import apiServicePlugin, { createProxyHandler } from '@equinor/fusion-framework-vite-plugin-api-service';
 *
 * export default defineConfig({
 *   plugins: [
 *     apiServicePlugin({
 *       proxyHandler: createProxyHandler(
 *         'https://discovery.example.com/services',
 *         (data, { route }) => ({ data, routes: [] }),
 *       ),
 *     }),
 *   ],
 * });
 * ```
 *
 * @packageDocumentation
 */

export { default, plugin, type PluginOptions, type PluginArguments } from './api-service-plugin.js';
export { createRouteMatcher, type Matcher, type MatchResult } from './create-route-matcher.js';
export { createProxyHandler, type ApiDataProcessor } from './create-proxy-handler.js';
export { createResponseInterceptor } from './create-response-interceptor.js';

export { DEFAULT_VALUES } from './constants.js';

export * from './types.js';
