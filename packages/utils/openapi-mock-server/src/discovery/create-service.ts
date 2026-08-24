import { createRouter } from './create-router.js';
import type { FieldFakerMap, OpenApiDocumentLike } from '@equinor/fusion-openapi-mock';
import type { Router } from './create-router.js';
import type { ServiceMockDefinition } from './discover-services.js';

/** A {@link ServiceMockDefinition} with chainable `withFields`/`middleware`, see {@link ServiceBuilder}. */
export interface ServiceBuilder extends ServiceMockDefinition {
  /** Merges `fields` into this service's field-faker overrides, for a field a document's own inline `faker` keyword can't express (e.g. a function). Returns `this` for chaining. */
  withFields(fields: FieldFakerMap): ServiceBuilder;
  /** Registers routes on this service's {@link Router}, checked ahead of its generated mock responses. Returns `this` for chaining. */
  middleware(register: (router: Router) => void): ServiceBuilder;
}

/**
 * Builds a {@link ServiceMockDefinition} inline in code, with chainable `withFields`/`middleware`
 * (see {@link ServiceBuilder}) — for a field faker or route that can't live in the document's own
 * inline `faker: "..."` schema keyword or static `paths` override, without needing a separate
 * `<key>.overrides.*` sidecar file.
 *
 * @param key - The mock server's routing key for this service, and its service-discovery `key`.
 * @param document - The parsed OpenAPI document, ready for `createOpenApiMock`.
 * @returns A {@link ServiceBuilder} — itself a valid `ServiceMockDefinition`.
 *
 * @example
 * ```typescript
 * createService('people', people)
 *   .withFields({ 'Person.avatarUrl': fakeAvatar })
 *   .middleware((router) => router.post('/people-picker/resolve', handler));
 * ```
 */
export function createService(key: string, document: OpenApiDocumentLike): ServiceBuilder {
  return new ServiceDefinitionBuilder(key, document);
}

/**
 * Backs {@link createService} — data fields are own (enumerable) properties, so two builders
 * with the same data still compare equal by `toEqual`; `withFields`/`middleware` live on the
 * prototype instead, so the closures a second call to `createService` creates don't break that.
 */
class ServiceDefinitionBuilder implements ServiceBuilder {
  /** This service's field-faker overrides, merged from every `withFields()` call. */
  fields?: FieldFakerMap;
  /** This service's `middleware`-registered routes, created lazily on the first `middleware()` call. */
  router?: Router;

  /** @param key - See {@link createService}. @param document - See {@link createService}. */
  constructor(
    public key: string,
    public document: OpenApiDocumentLike,
  ) {}

  /**
   * See {@link ServiceBuilder.withFields}.
   *
   * @param fields - Field-faker overrides to merge in.
   * @returns `this`, for chaining.
   */
  withFields(fields: FieldFakerMap): ServiceBuilder {
    // Merge into any fields already registered, rather than replacing them wholesale.
    this.fields = { ...this.fields, ...fields };
    return this;
  }

  /**
   * See {@link ServiceBuilder.middleware}.
   *
   * @param register - Registers routes against this service's {@link Router}.
   * @returns `this`, for chaining.
   */
  middleware(register: (router: Router) => void): ServiceBuilder {
    this.router ??= createRouter();
    register(this.router);
    return this;
  }
}

export default createService;
