import type { z } from 'zod';

import type { FetchResponse } from '@equinor/fusion-framework-module-http';
import {
  type ResponseSelector,
  jsonSelector,
} from '@equinor/fusion-framework-module-http/selectors';

import type {
  ApiVersionContract,
  ExtractApiVersion,
  VersionedParsedArgs,
  VersionedResponse,
} from './types';

/**
 * Resolves an API version string from a named key or a raw version value.
 *
 * Endpoint functions accept both `'v1'` and `'1.0'`, so this lookup normalises
 * the caller's version identifier before a request path or schema is selected.
 * The version key is checked first; otherwise the value is matched directly.
 *
 * @template TApiVersions - Record mapping version keys to version strings.
 * @template TVersion - The version key or value provided by the caller.
 * @param apiVersions - Map of version keys to version strings.
 * @param version - Version key or raw version string to resolve.
 * @returns The resolved API version string.
 * @throws {Error} When the version is neither a key nor a value of `apiVersions`.
 *
 * @example
 * ```ts
 * enum ApiVersion { v1 = '1.0', v2 = '2.0' }
 * extractVersion(ApiVersion, 'v1'); // '1.0'
 * extractVersion(ApiVersion, '1.0'); // '1.0'
 * ```
 */
export const extractVersion = <
  TApiVersions extends Record<string, string>,
  TVersion extends string,
>(
  apiVersions: TApiVersions,
  version: TVersion,
): ExtractApiVersion<TApiVersions, TVersion> => {
  // Prefer an exact key match (e.g. 'v1') over scanning the raw version values
  if (Object.hasOwn(apiVersions, version)) {
    return apiVersions[version] as ExtractApiVersion<TApiVersions, TVersion>;
  }
  // Fall back to treating `version` as a raw version value rather than a key
  const extractedVersion = Object.values(apiVersions).find((v) => v === version);
  // Neither a key nor a raw version matched, so the caller passed an unsupported version
  if (!extractedVersion) {
    throw new Error(`Version ${version} is not supported`);
  }
  return extractedVersion as ExtractApiVersion<TApiVersions, TVersion>;
};

/**
 * Creates a response selector that validates the HTTP response body with a Zod schema.
 *
 * Combines the HTTP module's `jsonSelector` with Zod parsing, so an endpoint
 * rejects payloads the service contract does not allow instead of forwarding
 * them to the caller as loosely typed data.
 *
 * @template Output - The validated output type produced by the schema.
 * @param schema - The Zod schema used to parse and validate the response body.
 * @returns A `ResponseSelector` that extracts JSON and runs it through `schema.parse`.
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * const RoleSchema = z.object({ id: z.string(), name: z.string() });
 * const selector = schemaSelector(RoleSchema);
 * ```
 */
export const schemaSelector =
  <Output>(schema: z.ZodSchema<Output>): ResponseSelector<Output> =>
  async (response: FetchResponse<unknown>) =>
    schema.parse(await jsonSelector(response));

/**
 * Validates an empty successful response without attempting to parse a JSON body.
 *
 * Use this selector for endpoints whose contract specifies an empty body with a success status
 * other than `204 No Content`; `jsonSelector` only skips parsing for 204 responses.
 *
 * @param response - HTTP response whose success status must be validated.
 * @returns A promise that resolves to `undefined` after a successful response.
 * @throws {HttpJsonResponseError} When an unsuccessful response cannot be parsed as JSON.
 */
export const emptyResponseSelector: ResponseSelector<void> = async (
  response: FetchResponse<unknown>,
): Promise<void> => {
  // Preserve the HTTP module's structured error handling while successful empty responses skip JSON parsing.
  if (!response.ok) await jsonSelector(response);
};

/**
 * Parses caller input with the argument schema a version contract publishes for `version`.
 *
 * Endpoints resolve the concrete version first and then look the schema up, so
 * this helper keeps the parsed value typed by the *same* deferred version
 * expression the request builders declare. Parsing inline instead would collapse
 * the result to one version's concrete shape and break that association as soon
 * as a second version is added.
 *
 * @template TContract - The endpoint's version contract.
 * @template TVersion - Concrete API version to resolve.
 * @param contract - Version contract to read the argument schema from.
 * @param version - Concrete API version selecting the contract entry.
 * @param input - Caller-supplied arguments.
 * @returns The arguments parsed by the schema this version publishes.
 * @throws {z.ZodError} When the input does not satisfy the version's argument schema.
 *
 * @example
 * ```ts
 * const args = parseVersionedArgs(VersionContract, apiVersion, input);
 * ```
 */
export const parseVersionedArgs = <
  TContract extends ApiVersionContract,
  TVersion extends keyof TContract,
>(
  contract: TContract,
  version: TVersion,
  input: unknown,
): VersionedParsedArgs<TContract, TVersion> =>
  // `contract[version].args` is a deferred indexed access while `version` is generic,
  // so its `parse` widens to `unknown`; the contract guarantees the parsed shape.
  contract[version].args.parse(input) as VersionedParsedArgs<TContract, TVersion>;

/**
 * Builds a response selector from the schema a version contract publishes for `version`.
 *
 * Pairing the selector with the same contract entry the arguments were parsed
 * from is what guarantees a request cannot be validated against another
 * version's response shape.
 *
 * @template TContract - The endpoint's version contract.
 * @template TVersion - Concrete API version to resolve.
 * @param contract - Version contract to read the response schema from.
 * @param version - Concrete API version selecting the contract entry.
 * @returns A selector validating the response with this version's schema.
 *
 * @example
 * ```ts
 * const selector = versionedResponseSelector(VersionContract, apiVersion);
 * ```
 */
export const versionedResponseSelector = <
  TContract extends ApiVersionContract,
  TVersion extends keyof TContract,
>(
  contract: TContract,
  version: TVersion,
): ResponseSelector<VersionedResponse<TContract, TVersion>> =>
  // While `version` is generic the indexed access stays deferred and widens the
  // schema's output to `unknown`; the contract guarantees the response shape.
  schemaSelector(contract[version].response as z.ZodType<VersionedResponse<TContract, TVersion>>);
