import { ApiVersion } from './static';

/** Context entity returned by the v1 context API. */
type ApiContextEntity_v1 = {
  id: string;
  externalId: string | null;
  source: string | null;
  type: ApiContextType_v1;
  value: Record<string, unknown> | null;
  title: string | null;
  isActive: boolean;
  isDeleted: boolean;
  created: string;
  updated: string | null;
};

/** Placeholder for the v2 context entity (not yet defined). */
type ApiContextEntity_v2 = unknown;

type ApiContextEntityTypes = {
  [ApiVersion.v1]: ApiContextEntity_v1;
  [ApiVersion.v2]: ApiContextEntity_v2;
};

/**
 * Version-aware context entity type.
 *
 * Resolves to the concrete entity shape for a given {@link ApiVersion}.
 *
 * @template T - An `ApiVersion` member (e.g. `ApiVersion.v1`).
 */
export type ApiContextEntity<T extends string = ApiVersion> = T extends ApiVersion
  ? ApiContextEntityTypes[T]
  : unknown;

/** === types === */

/** Context type metadata returned by the v1 context API. */
type ApiContextType_v1 = {
  id: string;
  isChildType: boolean;
  parentTypeIds: string[] | null;
};

/** Placeholder for the v2 context type (not yet defined). */
type ApiContextType_v2 = unknown;

type ApiContextTypeTypes = {
  [ApiVersion.v1]: ApiContextType_v1;
  [ApiVersion.v2]: ApiContextType_v2;
};

/**
 * Version-aware context type metadata.
 *
 * @template T - An `ApiVersion` member.
 */
export type ApiContextType<T extends ApiVersion> = ApiContextTypeTypes[T];
