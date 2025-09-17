import type { z } from 'zod';

import type { FetchResponse } from '@equinor/fusion-framework-module-http';
import {
  type ResponseSelector,
  jsonSelector,
} from '@equinor/fusion-framework-module-http/selectors';

import type { ExtractApiVersion } from './types';

/**
 * Extracts the correct API version from the provided `apiVersions` object based on the given `version` parameter.
 *
 * @param apiVersions - An object mapping API version strings to their corresponding versions.
 * @param version - The version string to extract.
 * @returns The extracted API version, or throws an error if the version is not supported.
 */
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
 * Creates a response selector that parses the response body using the provided Zod schema.
 *
 * @param schema - The Zod schema to use for parsing the response body.
 * @returns A response selector function that parses the response body using the provided schema.
 */
export const schemaSelector =
  <Output>(schema: z.ZodSchema<Output>): ResponseSelector<Output> =>
  async (response: FetchResponse<unknown>) =>
    schema.parse(await jsonSelector(response));
