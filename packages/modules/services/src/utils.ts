import type { z } from 'zod';

import type { FetchResponse } from '@equinor/fusion-framework-module-http';
import {
  type ResponseSelector,
  jsonSelector,
} from '@equinor/fusion-framework-module-http/selectors';

import type { ExtractApiVersion } from './types';

/**
 * Resolves an API version string from a named key or raw version value.\n *\n * Looks up `version` as a key in `apiVersions` first; if not found,\n * searches the object values for a direct match. Throws when neither\n * lookup succeeds.\n *\n * @template TApiVersions - Record mapping version names to version strings.\n * @template TAllowedApiVersion - Allowed version constraint.\n * @template TVersion - The version string provided by the caller.\n * @param apiVersions - Map of version names to version strings.\n * @param version - Version key or raw version string to resolve.\n * @returns The resolved API version string.\n * @throws {Error} When the version is not found in `apiVersions`.\n *\n * @example\n * ```ts\n * enum ApiVersions { v1 = '1.0', v2 = '2.0' }\n * extractVersion(ApiVersions, 'v1'); // '1.0'\n * extractVersion(ApiVersions, '1.0'); // '1.0'\n * ```\n */
export const extractVersion = <
  TApiVersions extends Record<string, string>,
  TAllowedApiVersion extends string,
  TVersion extends string,
>(
  apiVersions: TApiVersions,
  version: TVersion,
): ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion> => {
  if (version in apiVersions) {
    return apiVersions[version] as ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion>;
  }
  const extractedVersion = Object.values(apiVersions).find((v) => v === version);
  if (!extractedVersion) {
    throw new Error(`Version ${version} is not supported`);
  }
  return extractedVersion as ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion>;
};

/**
 * Creates a response selector that parses the HTTP response body with a Zod schema.\n *\n * Combines the built-in `jsonSelector` with Zod validation, ensuring the\n * response body matches the expected shape at runtime.\n *\n * @template Output - The validated output type produced by the schema.\n * @param schema - The Zod schema used to parse and validate the response body.\n * @returns A `ResponseSelector` that extracts JSON and runs it through `schema.parse`.\n *\n * @example\n * ```ts\n * import { z } from 'zod';\n * const UserSchema = z.object({ id: z.string(), name: z.string() });\n * const selector = schemaSelector(UserSchema);\n * ```\n */
export const schemaSelector =
  <Output>(schema: z.ZodSchema<Output>): ResponseSelector<Output> =>
  async (response: FetchResponse<unknown>) =>
    schema.parse(await jsonSelector(response));
