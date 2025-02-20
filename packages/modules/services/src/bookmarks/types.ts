import type {
  FilterAllowedApiVersions as FilterAllowApiVersionsBase,
  ExtractApiVersion as ExtractApiVersionBase,
} from '../types';

import { ApiVersion } from './api-version';

export { ClientMethodType, ClientMethod, ApiClientArguments } from '../types';

export type FilterAllowedApiVersions<TAllowed extends string = keyof typeof ApiVersion> =
  FilterAllowApiVersionsBase<typeof ApiVersion, TAllowed>;

export type ExtractApiVersion<
  TVersion extends string,
  TAllowed extends string = FilterAllowedApiVersions,
> = ExtractApiVersionBase<typeof ApiVersion, TVersion, TAllowed>;
