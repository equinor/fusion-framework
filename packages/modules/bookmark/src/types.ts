import { QueryFn, QueryCtorOptions } from '@equinor/fusion-query';

export interface Bookmark<TData> {
    id: string;
    name: string;
    description: string;
    isShared: boolean;
    payload: TData;
    appKey: string;
    context?: Context;
    createdBy: CreatedBy;
    updatedBy: CreatedBy;
    created: string;
    updated: string;
    sourceSystem: SourceSystem;
}

export type CreateBookmark<T = unknown> = {
    /** Display name of the bookmark */
    name: string;
    description?: string;
    /** Is the bookmark shared with others */
    isShared: boolean;
    /** Name of the app it belongs too, should correspond to a fusion appkey */
    appKey: string;
    contextId?: string;
    /** Any JSON object to store as the bookmark payload */
    payload: T;
    sourceSystem?: Partial<SourceSystem>;
};

export interface SourceSystem {
    identifier: string;
    name: string;
    subSystem: string;
}

interface CreatedBy {
    azureUniqueId: string;
    mail: string;
    name: string;
    phoneNumber: string;
    jobTitle: string;
    accountType: number;
    accountClassification: number;
}

interface Context {
    id: string;
    name: string;
    type: string;
}

export type GetBookmarkParameters = { id: string };

export type GetAllBookmarksParameters = { isValid: boolean };

export interface BookmarkQueryClient {
    getAllBookmarks:
        | QueryFn<Array<Bookmark<unknown>>, GetAllBookmarksParameters>
        | QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
    getBookmarkById:
        | QueryFn<Bookmark<unknown>, GetBookmarkParameters>
        | QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
}
