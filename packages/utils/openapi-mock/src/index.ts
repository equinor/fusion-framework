/**
 * Fakes OpenAPI 3 responses straight from a spec document.
 *
 * @remarks
 * Point {@link createOpenApiMock} at a parsed `openapi.json`/`openapi.yaml`
 * and every named operation is faked from its declared response schema — no
 * hand-written fixtures until a specific edge case needs one, at which point
 * {@link OpenApiMockOptions.overrides} (or {@link OpenApiMock.register})
 * replaces just that operation.
 *
 * This package has no opinion on HTTP or routing frameworks: {@link OpenApiMock.resolve}
 * takes a plain `{ method, path, query }` and returns a plain
 * `{ status, mock }`, so it drops into `@equinor/fusion-framework-module-http`'s
 * mock router, `openapi-backend`, Express, or a hand-rolled server equally
 * easily.
 *
 * @packageDocumentation
 */

export { applyFieldFakers, type ApplyFieldFakersResult } from './apply-field-fakers';
export { createOpenApiMock } from './create-open-api-mock';
export { dereferenceSchema } from './dereference-schema';
export { fetchOpenApiDocument, type FetchOpenApiDocumentOptions } from './fetch-open-api-document';
export {
  generateMockFromSchema,
  type GenerateMockFromSchemaOptions,
} from './generate-mock-from-schema';
export { loadFakerMap, type LoadFakerMapOptions } from './load-faker-map';
export type {
  FakerPath,
  FieldFakerContext,
  FieldFakerFn,
  FieldFakerMap,
  FieldFakerValue,
  OpenApiDocumentLike,
  OpenApiMock,
  OpenApiMockOptions,
  OpenApiMockOverride,
  OpenApiMockOverrideContext,
  OpenApiMockRequest,
  OpenApiMockResolution,
  OpenApiMockResponse,
} from './types';
