import type { ServiceMockDefinition } from '../discovery/discover-services.js';
import { createOpenApiMock, type OpenApiMock } from '@equinor/fusion-openapi-mock';

/** Resolves `document.paths[path][method].operationId`, or throws a descriptive error. */
function resolveOperationId(
  definition: ServiceMockDefinition,
  path: string,
  method: string,
): string {
  const operation = definition.document?.paths?.[path]?.[method];
  const operationId = (operation as { operationId?: string } | undefined)?.operationId;
  // No matching operation, or one with no operationId: this override can't be resolved.
  if (!operationId) {
    throw new Error(
      `Service "${definition.key}" has no "${method.toUpperCase()} ${path}" operation with an "operationId" to override — check its defineService "routes" against the OpenAPI schema's "paths".`,
    );
  }
  return operationId;
}

/** Registers a service module's declarative routes on a freshly built mock. */
function applyStaticRoutes(mock: OpenApiMock, definition: ServiceMockDefinition): void {
  // Walk every overridden path, one at a time.
  for (const [path, methods] of Object.entries(definition.paths ?? {})) {
    // Walk every overridden method on this path, one at a time.
    for (const [method, route] of Object.entries(methods)) {
      const operationId = resolveOperationId(definition, path, method);
      // A function route is already a full `OpenApiMockOverride` handler; register it as-is.
      if (typeof route === 'function') {
        mock.register(operationId, route);
        // Already registered above: skip the static { status, mock } branch below.
        continue;
      }
      mock.register(operationId, async ({ mockResponseForOperation }) => {
        const baseline = await mockResponseForOperation();
        return { status: route.status ?? baseline.status, mock: route.mock };
      });
    }
  }
}

/**
 * Builds the `OpenApiMock` a service starts (or resets back to) with declarative
 * `defineService` routes already applied, so they behave as this service's
 * baseline rather than something a test has to (re-)register at runtime.
 *
 * @param definition - The service's discovered mock definition. Must have already been
 *   merged (via `mergeServiceDefinitions`) so an inherited `document` is resolved.
 * @param seed - The mock server's own seed (see `CreateMockServerOptions`), applied uniformly to every service.
 * @returns A new `OpenApiMock` for `definition`, with its static routes (if any) applied.
 * @throws {Error} If `definition.document` is missing, or a `paths` override names a path/method the document doesn't declare an `operationId` for.
 */
export function buildMock(definition: ServiceMockDefinition, seed?: number): OpenApiMock {
  // mergeServiceDefinitions guarantees this for every definition it returns; a caller bypassing it is a bug.
  if (!definition.document) {
    throw new Error(
      `Service "${definition.key}" has no OpenAPI document — did you call it through mergeServiceDefinitions?`,
    );
  }
  const mock = createOpenApiMock(definition.document, { fields: definition.fields, seed });
  applyStaticRoutes(mock, definition);
  return mock;
}
