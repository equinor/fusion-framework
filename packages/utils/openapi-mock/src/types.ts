/**
 * A parsed OpenAPI (3.x) document.
 *
 * @remarks
 * Typed loosely — only the shape {@link createOpenApiMock} actually reads —
 * on purpose, so this package has no dependency on a full OpenAPI type
 * package. Anything JSON-parsed from a real `openapi.json` satisfies this.
 */
export interface OpenApiDocumentLike {
  paths?: Record<string, Record<string, unknown>>;
  components?: Record<string, unknown>;
  [key: string]: unknown;
}

/** A faked (or overridden) response for one operation. */
export interface OpenApiMockResponse {
  /** The HTTP status code the OpenAPI document declares for this response. */
  status: number;
  /** The response body, faked from the operation's schema unless overridden. */
  mock: unknown;
}

/** What an {@link OpenApiMockOverride} is called with. */
export interface OpenApiMockOverrideContext {
  /** The `operationId` this override was registered for. */
  operationId: string;
  /** The HTTP method of the matched request. */
  method: string;
  /** The path of the matched request. */
  path: string;
  /** Path parameters extracted from the request, keyed by name (e.g. `{ petId: '1' }` for `/pets/{petId}`). */
  params: Record<string, string>;
  /** Query parameters of the matched request. */
  query: Record<string, string>;
  /**
   * Generates the same faked response {@link createOpenApiMock} would have
   * returned without an override — so an override only needs to replace the
   * one field an edge case cares about, rather than rebuild the whole body.
   */
  mockResponseForOperation(): Promise<OpenApiMockResponse>;
}

/**
 * Replaces the faked response for one `operationId`.
 *
 * @remarks
 * Registered through {@link OpenApiMock.register} or
 * {@link OpenApiMockOptions.overrides}; only for the operations that need a
 * specific edge case — every other operation keeps faking straight from the
 * schema.
 */
export type OpenApiMockOverride = (
  context: OpenApiMockOverrideContext,
) => OpenApiMockResponse | Promise<OpenApiMockResponse>;

/** A request to resolve against the OpenAPI document. */
export interface OpenApiMockRequest {
  /** The HTTP method, matched case-insensitively. */
  method: string;
  /** The request path, matched against the document's path templates (e.g. `/pets/{petId}`). */
  path: string;
  /** Query parameters, forwarded to a matched {@link OpenApiMockOverride} as-is. */
  query?: Record<string, string>;
}

/** The result of resolving a request to a matched operation. */
export interface OpenApiMockResolution extends OpenApiMockResponse {
  /** The `operationId` of the matched operation. */
  operationId: string;
  /** Path parameters extracted from the request. */
  params: Record<string, string>;
}

/** What a {@link FieldFakerFn} is called with. */
export interface FieldFakerContext {
  /** The name of the OpenAPI component schema this field belongs to (e.g. `User`). */
  modelName: string;
  /** The dotted path of the field within `modelName` (e.g. `['address', 'city']`). */
  path: readonly string[];
}

/**
 * Fakes one field's value directly, for a field a `@faker-js/faker` path
 * string can't express (composing several generators, reading from `path`,
 * anything imperative).
 */
export type FieldFakerFn = (context: FieldFakerContext) => unknown;

/**
 * A dotted `@faker-js/faker` path (e.g. `"internet.email"`), resolved against
 * the real `faker` instance the same way the schema-level `faker: "..."`
 * extension keyword already is.
 */
export type FakerPath = string;

/** One entry of a {@link FieldFakerMap}: either a faker path or a function. */
export type FieldFakerValue = FakerPath | FieldFakerFn;

/**
 * Describes how to fake specific fields of specific OpenAPI component
 * schemas, without editing the document itself.
 *
 * @remarks
 * Keyed `"<ModelName>.<field>"` (nested fields dot further, e.g.
 * `"User.address.city"`), where `ModelName` is the last segment of the
 * `$ref` a field's schema was reached through — i.e. the name a schema is
 * declared under in `#/components/schemas`. Only fields reached through a
 * named component schema are addressable this way; an inline (anonymous)
 * response body has no `ModelName` to key on.
 *
 * `.json`/`.yml`/`.yaml` sidecar files can only hold {@link FakerPath}
 * strings; a `.ts`/`.js` sidecar can export real {@link FieldFakerFn}s too —
 * see `loadFakerMap`.
 *
 * @example
 * ```typescript
 * const fields: FieldFakerMap = {
 *   'User.email': 'internet.email',
 *   'User.avatarUrl': 'image.avatar',
 *   'User.id': ({ path }) => `usr_${path.join('-')}_${crypto.randomUUID()}`,
 * };
 * ```
 */
export type FieldFakerMap = Record<string, FieldFakerValue>;

/** Options for {@link createOpenApiMock}. */
export interface OpenApiMockOptions {
  /** Per-`operationId` overrides, applied from the start instead of through {@link OpenApiMock.register}. */
  overrides?: Record<string, OpenApiMockOverride>;

  /**
   * Seeds the faked responses, so the same document and seed always produce
   * the same values — useful for a repeatable test rather than one that
   * asserts against `expect.any(...)`.
   *
   * @remarks
   * Every faked response reseeds from this value, so two different
   * operations (or the same operation resolved twice) both fake
   * deterministically, rather than the seed being consumed once and drifting
   * across calls.
   */
  seed?: number;

  /**
   * Per-model field overrides, applied whenever a faked field is reached
   * through the corresponding OpenAPI component schema — see
   * {@link FieldFakerMap} for the key format and {@link loadFakerMap} for
   * loading one from a sidecar file instead of building it in code.
   */
  fields?: FieldFakerMap;
}

/**
 * Fakes and resolves responses for the operations of one OpenAPI document.
 *
 * @see {@link createOpenApiMock}
 */
export interface OpenApiMock {
  /**
   * Fakes the response for one operation, by `operationId`, ignoring any
   * request matching — useful for a hand-rolled "not implemented" fallback
   * (e.g. wiring this into `openapi-backend`'s own routing) or for building
   * a partial override from within another {@link OpenApiMockOverride}.
   *
   * @throws {Error} If no operation with this `operationId` exists in the document.
   */
  mockResponseForOperation(operationId: string): Promise<OpenApiMockResponse>;

  /**
   * Matches a request against the document's paths and fakes (or resolves an
   * override for) the matched operation's response.
   *
   * @returns The resolution, or `undefined` if no operation matches the method and path.
   */
  resolve(request: OpenApiMockRequest): Promise<OpenApiMockResolution | undefined>;

  /**
   * Registers (or replaces) the override for one `operationId`.
   *
   * @throws {Error} If no operation with this `operationId` exists in the document.
   */
  register(operationId: string, handler: OpenApiMockOverride): void;
}
