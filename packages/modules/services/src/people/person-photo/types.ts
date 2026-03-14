import type { BlobResult } from '@equinor/fusion-framework-module-http/client';
import { ApiVersion } from '../static';
import type { ClientDataMethod } from '../../types';

/** API versions that support the person photo endpoint. */
export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2'>;

type ApiRequestArgsMap = {
  [ApiVersion.v2]: {
    azureId: string;
  };
};

/** Union of all valid request argument shapes across supported versions. */
export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

/**
 * Version-aware request argument type for the person photo endpoint.
 *
 * @template T - Supported API version key.
 */
export type ApiRequestArgs<T extends SupportedApiVersion> =
  ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes = {
  [ApiVersion.v2]: BlobResult;
};

/**
 * Version-aware response type for the person photo endpoint.
 *
 * @template T - Supported API version key.
 */
export type ApiResponse<T extends SupportedApiVersion> = ApiResponseTypes[(typeof ApiVersion)[T]];

/**
 * Result type for the person photo endpoint.
 *
 * @template TMethod - Client execution method (`'blob'` or `'blob$'`).
 */
export type ApiResult<TMethod extends keyof ClientDataMethod = keyof ClientDataMethod> =
  ClientDataMethod[TMethod];
