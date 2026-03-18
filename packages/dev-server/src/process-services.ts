import type { ApiDataProcessor, ApiRoute } from '@equinor/fusion-framework-vite-plugin-api-service';
import type { FusionService } from './types.js';

/**
 * Remap Fusion service discovery entries so their URIs point through the local dev server proxy,
 * and generate matching Vite proxy routes for each service.
 *
 * Use this as the default `api.processServices` handler in {@link DevServerOptions}, or call it
 * inside a custom handler to get the base mapping before applying additional transformations
 * (e.g. adding mock services or filtering environments).
 *
 * @param data - Array of {@link FusionService} entries returned by the service discovery endpoint.
 * @param args - Context provided by the API service plugin.
 * @param args.route - Base route path used to construct local proxy URLs (e.g. `'/services-proxy'`).
 * @param args.request - Incoming HTTP request; the `referer` header is used to resolve the local origin.
 * @returns An object with `data` (services with rewritten URIs) and `routes` (Vite proxy route configs).
 * @throws {Error} When `data` is not an array, indicating an unexpected service discovery response.
 *
 * @example
 * ```typescript
 * const services = [
 *   { key: 'service1', uri: 'http://example.com/api', name: 'Service 1' },
 *   { key: 'service2', uri: 'http://example.org/api', name: 'Service 2' },
 * ];
 * const args = {
 *   route: '/proxy',
 *   request: { headers: { referer: 'http://localhost:3000' } },
 * };
 * const result = processServices(services, args);
 * console.log(result.data); // Processed services with updated URIs
 *
 * // Expected output:
 * // result.data:
 * // [
 * //   { key: 'service1', uri: 'http://localhost:3000/proxy/service1', name: 'Service 1' },
 * //   { key: 'service2', uri: 'http://localhost:3000/proxy/service2', name: 'Service 2' },
 * // ]
 *
 * console.log(result.routes); // Generated proxy routes
 *
 * // result.routes:
 * // [
 * //   {
 * //     match: '/service1/api*sub',
 * //     proxy: {
 * //       target: 'http://example.com',
 * //       rewrite: (path) => path.replace('/service1', ''),
 * //     },
 * //   },
 * //   {
 * //     match: '/service2/api*sub',
 * //     proxy: {
 * //       target: 'http://example.org',
 * //       rewrite: (path) => path.replace('/service2', ''),
 * //     },
 * //   },
 * // ]
 * ```
 */
export const processServices: ApiDataProcessor<FusionService[]> = (data, args) => {
  const { route, request } = args;
  const apiRoutes = [] as ApiRoute[];
  const apiServices = [] as FusionService[];

  if (!Array.isArray(data)) {
    throw new Error('Invalid data format');
  }

  // remap all services to proxy though the dev server
  // and generate the proxy routes
  for (const service of data as FusionService[]) {
    // append host, port and protocol to the service uri
    // and replace the path with the local proxy path
    const serviceUrl = new URL(`${route}/${service.key}`, request.headers.referer);
    apiServices.push({ ...service, uri: String(serviceUrl) });

    // add the proxy route
    const url = new URL(service.uri);
    apiRoutes.push({
      match: `/${service.key}${url.pathname}*sub`,
      proxy: {
        target: url.origin,
        rewrite: (path) => path.replace(`/${service.key}`, ''),
      },
    });
  }
  return { data: apiServices, routes: apiRoutes };
};

export default processServices;
