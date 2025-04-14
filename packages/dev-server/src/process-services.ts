import type { ApiDataProcessor, ApiRoute } from '@equinor/fusion-framework-vite-plugin-api-service';
import type { FusionService } from './types.js';

/**
 * Processes an array of Fusion services, remapping their URIs to proxy through the development server
 * and generating corresponding proxy routes.
 *
 * @template T - The type of the input data, expected to be an array of `FusionService`.
 * @param data - The input array of Fusion services to process.
 * @param args - Additional arguments containing the route and request information.
 * @param args.route - The base route used to construct the proxy paths.
 * @param args.request - The HTTP request object, used to extract the referer header.
 * @returns An object containing the processed services and the generated proxy routes.
 * @throws {Error} If the input data is not an array.
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
