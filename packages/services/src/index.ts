/**
 * @packageDocumentation
 *
 * Function-based clients for Fusion platform services.
 *
 * Each service exposes one function per published API operation. A function takes an
 * `IHttpClient` from `@equinor/fusion-framework-module-http` and issues exactly one HTTP request
 * against that service, so an application bundles only the operations it imports.
 *
 * Service APIs are intentionally exposed only through service-specific package
 * subpaths so adding new services never turns the package root into a monolithic
 * namespace. Import Roles endpoints — roles, role assignments to user and application
 * accounts, claimable roles, systems, and scope types — from
 * `@equinor/fusion-services/roles`, and the published Roles API 1.0 OpenAPI document from
 * `@equinor/fusion-services/roles/v1/openapi.json`.
 *
 * @example
 * ```ts
 * import { getRole } from '@equinor/fusion-services/roles';
 *
 * const role = await getRole('v1', httpClient)({ roleIdentifier: 'reader' });
 * ```
 */
