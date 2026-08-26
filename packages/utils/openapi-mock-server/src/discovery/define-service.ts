import type { FieldFakerValue, OpenApiDocumentLike } from '@equinor/fusion-openapi-mock';

import { createRouter, type Router } from './create-router.js';
import type { ServiceMockDefinition } from './discover-services.js';
import { flattenSchemaOverrides } from './flatten-schema-overrides.js';
import type { RouteOverride } from './route-override.js';

/** Controls how a local mock participates in the mock server's service-discovery response. */
export type ServiceDiscoveryMode = false | 'merge' | 'new' | 'replace';

/** Shared options accepted by every {@link defineService} mode. */
interface DefineServiceBaseOptions {
  /** Routing key used by `<key>.localhost` and service discovery. */
  key: string;
  /** Declarative response overrides keyed by OpenAPI path and HTTP method. */
  routes?: Record<string, Record<string, RouteOverride>>;
  /** Field faker overrides keyed by schema component and property. */
  components?: Record<string, Record<string, FieldFakerValue>>;
  /** Registers imperative routes that run before declarative and generated responses. */
  middleware?: (router: Router) => void;
}

/** Options for merging behavior onto an earlier service definition. */
export interface MergeServiceOptions extends DefineServiceBaseOptions {
  /** Merges this module onto an earlier definition and replaces its upstream discovery URI locally. */
  serviceDiscovery: 'merge';
  /** Optional replacement schema; the earlier definition's schema is retained when omitted. */
  schema?: OpenApiDocumentLike;
}

/** Options for a complete direct-only or discovery-replacing service definition. */
export interface CompleteServiceOptions extends DefineServiceBaseOptions {
  /** Hides, adds, or replaces the service's discovery entry. */
  serviceDiscovery: false | 'new' | 'replace';
  /** OpenAPI document used to generate baseline responses. */
  schema: OpenApiDocumentLike;
}

/** Options accepted by {@link defineService}. */
export type DefineServiceOptions = MergeServiceOptions | CompleteServiceOptions;

/**
 * Defines an OpenAPI mock service or a merge onto an earlier service for a `<name>.mock.ts` module.
 *
 * @param options - Service schema, routing behavior, overrides, and discovery behavior.
 * @returns A normalized service definition consumed by the mock server.
 *
 * @example
 * ```typescript
 * export default defineService({
 *   key: 'people',
 *   serviceDiscovery: 'merge',
 *   components: { Person: { name: () => 'Leela' } },
 * });
 * ```
 */
export function defineService(options: DefineServiceOptions): ServiceMockDefinition {
  let router: Router | undefined;
  // Imperative middleware needs a concrete router before the definition reaches the server.
  if (options.middleware) {
    router = createRouter();
    options.middleware(router);
  }

  return {
    key: options.key,
    serviceDiscovery: options.serviceDiscovery,
    document: options.schema,
    fields: flattenSchemaOverrides(options.components),
    paths: options.routes,
    router,
  };
}

export default defineService;
