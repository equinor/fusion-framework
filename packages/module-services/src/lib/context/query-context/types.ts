import { ApiVersion } from '../static';
import { ApiContextEntity } from '../api-models';

type QueryContextArgs_v1 = {
    query: {
        includeDeleted?: boolean;
        filter: string;
        expand?: string[];
    };
};

type QueryContextArgs_v2 = QueryContextArgs_v1;

type SearchContextArgTypes = {
    [ApiVersion.v1]: QueryContextArgs_v1;
    [ApiVersion.v2]: QueryContextArgs_v2;
};

export type QueryContextArgs<T extends ApiVersion> = SearchContextArgTypes[T];

type QueryContextResponseTypes = {
    [ApiVersion.v1]: Array<ApiContextEntity<ApiVersion.v1>>;
    [ApiVersion.v2]: Array<ApiContextEntity<ApiVersion.v2>>;
};

export type QueryContextResponse<T extends ApiVersion> = QueryContextResponseTypes[T];
