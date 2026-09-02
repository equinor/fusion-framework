import type {
  ClientRequestInit,
  FetchRequestInit,
  IHttpClient,
  JsonRequest,
} from '@equinor/fusion-framework-module-http/client';

import type {
  ClientMethod,
  ClientMethodType,
  ExtractApiVersion,
  FilterAllowedApiVersions,
  VersionedArgs,
  VersionedParsedArgs,
  VersionedResponse,
} from '../../types';
import { extractVersion, parseVersionedArgs, versionedResponseSelector } from '../../utils';

import { SyntheticApiVersion } from './synthetic-api-version';
import { SyntheticVersionContract } from './synthetic-version-contract';

/** Version identifiers the synthetic endpoint accepts (`'v1' | '1.0' | 'v2' | '2.0'`). */
export type SyntheticAllowedVersions = FilterAllowedApiVersions<typeof SyntheticApiVersion>;

/** Resolves an accepted identifier to the concrete synthetic version it names. */
export type SyntheticVersion<TVersion extends SyntheticAllowedVersions> = ExtractApiVersion<
  typeof SyntheticApiVersion,
  TVersion
>;

/** Arguments the selected synthetic version accepts. */
export type SyntheticArg<TVersion extends SyntheticAllowedVersions> = VersionedArgs<
  typeof SyntheticVersionContract,
  SyntheticVersion<TVersion>
>;

/** Response the selected synthetic version publishes. */
export type SyntheticResponse<TVersion extends SyntheticAllowedVersions> = VersionedResponse<
  typeof SyntheticVersionContract,
  SyntheticVersion<TVersion>
>;

/** Result of the selected client method, carrying the selected version's response type. */
export type SyntheticResult<
  TVersion extends SyntheticAllowedVersions,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<SyntheticResponse<TVersion>>[TMethod];

/** Builds the request path for the resolved synthetic version. */
const generateApiPath = <TVersion extends SyntheticApiVersion>(
  version: TVersion,
  args: VersionedParsedArgs<typeof SyntheticVersionContract, TVersion>,
): string => {
  // Each version addresses its resource through a different argument field, which is
  // exactly the narrowing a real second version of an endpoint would need.
  if (version === SyntheticApiVersion.v1) {
    const { roleIdentifier } = args as VersionedParsedArgs<
      typeof SyntheticVersionContract,
      SyntheticApiVersion.v1
    >;
    return `/things/${encodeURIComponent(roleIdentifier)}?api-version=${version}`;
  }
  const { roleId, scope } = args as VersionedParsedArgs<
    typeof SyntheticVersionContract,
    SyntheticApiVersion.v2
  >;
  return `/things/${encodeURIComponent(roleId)}?api-version=${version}&scope=${encodeURIComponent(scope)}`;
};

/**
 * Test-only endpoint factory built from the two-version synthetic contract.
 *
 * Mirrors the production endpoint shape exactly — resolve the alias, parse with
 * the resolved version's argument schema, build that version's path, and install
 * that version's response schema as the selector — so the type tests exercise the
 * same generic machinery the shipped endpoints use.
 *
 * @template TVersion - Version identifier the caller passes.
 * @template TMethod - Client method used to execute the request.
 * @param version - Version key (`'v1'`) or concrete version (`'1.0'`).
 * @param client - HTTP client executing the request.
 * @param method - Client method to execute the request with.
 * @returns A request function accepting the arguments of the resolved version.
 * @throws {Error} When the version is not published by the synthetic API.
 *
 * @example
 * ```ts
 * syntheticEndpoint('v2', client)({ roleId: 'role-1', scope: 'global' });
 * ```
 */
export const syntheticEndpoint = <
  TVersion extends SyntheticAllowedVersions,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  const apiVersion = extractVersion(SyntheticApiVersion, version);
  return (
    input: SyntheticArg<TVersion>,
    init?: ClientRequestInit<IHttpClient, SyntheticResponse<TVersion>>,
  ): SyntheticResult<TVersion, TMethod> => {
    const args = parseVersionedArgs(SyntheticVersionContract, apiVersion, input);
    const baseInit: FetchRequestInit<SyntheticResponse<TVersion>, JsonRequest> = {
      selector: versionedResponseSelector(SyntheticVersionContract, apiVersion),
    };
    // The generated defaults are applied after caller overrides, as in production, so a
    // caller-supplied `selector` can never bypass the version's response validation.
    const requestInit = Object.assign({}, init, baseInit);
    return client[method](generateApiPath(apiVersion, args), requestInit) as SyntheticResult<
      TVersion,
      TMethod
    >;
  };
};
