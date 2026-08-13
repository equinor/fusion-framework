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
 * @remarks
 * Everything this entry point exports is safe for a browser (or browser-mode Vitest) runtime.
 * `loadFakerMap` reads from the filesystem and shells out to `esbuild` to load a `.ts`/`.js`
 * sidecar, so it lives at the separate `@equinor/fusion-openapi-mock/node` entry point instead —
 * importing it here would pull `node:fs`/esbuild into every consumer's bundle, including ones
 * that only ever call {@link createOpenApiMock} with an already-built `fields` map.
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
