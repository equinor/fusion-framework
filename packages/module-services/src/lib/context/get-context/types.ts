import { ApiVersion } from '../static';
import { ApiContextEntity } from '../api-models';

type GetContextArgs_v1 = {
    id: string;
};

type GetContextArgs_v2 = GetContextArgs_v1;

type GetContextArgsTypes = {
    [ApiVersion.v1]: GetContextArgs_v1;
    [ApiVersion.v2]: GetContextArgs_v2;
};

export type GetContextArgs<T extends ApiVersion> = GetContextArgsTypes[T];

type GetContextResponse_v1 = ApiContextEntity<ApiVersion.v1>;

type GetContextResponse_v2 = ApiContextEntity<ApiVersion.v2>;

type GetContextResponseTypes = {
    [ApiVersion.v1]: GetContextResponse_v1;
    [ApiVersion.v2]: GetContextResponse_v2;
};

export type GetContextResponse<T extends ApiVersion> = GetContextResponseTypes[T];
