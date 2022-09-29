import { ApiVersion } from './static';

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

type ApiContextEntity_v2 = ApiContextEntity_v1;

type ApiContextEntityTypes = {
    [ApiVersion.v1]: ApiContextEntity_v1;
    [ApiVersion.v2]: ApiContextEntity_v2;
};

export type ApiContextEntity<T extends string = ApiVersion> = T extends ApiVersion
    ? ApiContextEntityTypes[T]
    : unknown;

/** === types === */

type ApiContextType_v1 = {
    id: string;
    isChildType: boolean;
    parentTypeIds: string[] | null;
};

type ApiContextType_v2 = ApiContextType_v1;

type ApiContextTypeTypes = {
    [ApiVersion.v1]: ApiContextType_v1;
    [ApiVersion.v2]: ApiContextType_v2;
};

export type ApiContextType<T extends ApiVersion> = ApiContextTypeTypes[T];
