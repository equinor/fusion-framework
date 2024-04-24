import { QueryFn, QueryCtorOptions } from '@equinor/fusion-query';
import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { type ObservableInput } from 'rxjs';

export interface PatchBookmark<TData = unknown> extends Partial<Bookmark<TData>> {
    id: string;
    appKey: string;
}
export interface Bookmark<TData = unknown> {
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
    sourceSystem?: SourceSystem;
}

export type CreateBookmark<TData = unknown> = {
    /** Display name of the bookmark */
    name: string;
    description?: string;
    /** Is the bookmark shared with others */
    isShared: boolean;
    /** Name of the app it belongs too, should correspond to a fusion appkey */
    appKey: string;
    contextId?: string;
    /** Any JSON object to store as the bookmark payload */
    payload: TData;
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

export interface BookmarksApiClient<TType = unknown> {
    getAll: <T = TType>() => ObservableInput<Array<Bookmark<T>>>;
    getById: <T = TType>(id: string) => ObservableInput<Bookmark<T>>;
    addFavorite: (bookmarkId: string) => ObservableInput<void>;
    removeFavorite: (bookmarkId: string) => ObservableInput<void>;
    verifyFavorite: (bookmarkId: string) => ObservableInput<boolean>;
    create: <T = TType>(bookmark: Bookmark) => ObservableInput<Bookmark<T>>;
    update: <T = TType>(
        bookmark: Partial<Bookmark> & Pick<Bookmark, 'id'>,
    ) => ObservableInput<Bookmark<T>>;
    delete: (bookmarkId: string) => ObservableInput<boolean>;
}

export interface BookmarkModuleConfig {
    sourceSystem?: SourceSystem;
    client: BookmarksApiClient;
    resolveContextId: () => string | undefined;
    resolveApplicationKey: () => string | undefined;
    eventProvider?: IEventModuleProvider;
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

export type UpdateBookmarkOptions = {
    updatePayload: boolean;
};
