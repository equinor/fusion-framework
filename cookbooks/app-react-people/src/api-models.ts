// @TODO: Update types from any
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Project = {
    id: string;
    name: string;
    domainId: string | null;
    projectMasterId?: string | null;
};

export type Contract = {
    id: string;
    name: string;
    number: string;
};

export type Position = {
    name: string;
    appliesFrom: Date;
    appliesTo: Date;
    isActive: boolean;
    obs?: string | null;
    workPack?: string | null;
    positionExternalId?: string;
    locationName?: string | null;
    project: Project;
    contract?: Contract | null | undefined;
};

export type PersonDocument = {
    azureUniqueId: string;
    mail: string;
    name: string;
    jobTitle?: any;
    department?: any;
    mobilePhone?: any;
    officeLocation?: any;
    upn: string;
    accountType: string;
    isExpired: boolean;
    positions: Position[];
};

export type PersonResult = {
    document: PersonDocument;
    '@search.score': number;
};

export type PersonSearchResult = {
    results: PersonResult[];
    continuationToken?: ContinuationToken | null;
    count: number;
};

export type SearchNextPageParameters = {
    search: string;
    searchFields?: any;
    filter?: string;
    orderBy?: any;
    top?: any;
    skip: number;
    includeTotalResultCount: boolean;
};

export type ContinuationToken = {
    '@search.nextPageParameters': SearchNextPageParameters;
};
