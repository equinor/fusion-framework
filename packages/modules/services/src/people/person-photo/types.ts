import type { BlobResult } from '@equinor/fusion-framework-module-http/client';
import { ApiVersion } from '../static';
import type { ClientDataMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2'>;

type ApiRequestArgsMap = {
  [ApiVersion.v2]: {
    azureId: string;
  };
};

export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

export type ApiRequestArgs<T extends SupportedApiVersion> =
  ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes = {
  [ApiVersion.v2]: BlobResult;
};

export type ApiResponse<T extends SupportedApiVersion> = ApiResponseTypes[(typeof ApiVersion)[T]];

export type ApiResult<TMethod extends keyof ClientDataMethod = keyof ClientDataMethod> =
  ClientDataMethod[TMethod];
