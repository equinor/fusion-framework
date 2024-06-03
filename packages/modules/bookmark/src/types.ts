/**
 * Represents a bookmark, which is a saved item with metadata and custom data.
 *
 * @template TData - The type of the custom data associated with the bookmark.
 */
export type Bookmark = {
    /** Unique id of the bookmark */
    id: string;

    /** Display name of the bookmark */
    name: string;

    /** Description of the bookmark */
    description?: string;

    /** Is the bookmark shared with others */
    isShared?: boolean;

    /** Name of the app it belongs too, should correspond to a fusion appkey */
    appKey: string;

    /** Context information of the bookmark */
    context?: BookmarkContext;

    /** Information about the user who created the bookmark */
    createdBy: BookmarkUser;

    /** Information about the user who last updated the bookmark */
    updatedBy: BookmarkUser;

    /** Timestamp when the bookmark was created */
    created: string;

    /** Timestamp when the bookmark was last updated */
    updated: string;

    /** Source system information */
    sourceSystem?: BookmarkSourceSystem;
};

export type BookmarkWithData<TType = unknown> = Bookmark & Pick<BookmarkData<TType>, 'data'>;

export type BookmarkData<TData = unknown> = {
    /** reference to the bookmark */
    id: string;
    /** Optional custom data associated with the bookmark */
    data?: TData | Error;
    /** Optional context information for the bookmark */
    context?: BookmarkContext;
};

/**
 * Represents a user of the bookmark system.
 */
export type BookmarkUser = {
    /** The unique identifier of the user in Azure Active Directory */
    azureUniqueId: string;

    /** The email address of the user */
    mail: string;

    /** The full name of the user */
    name: string;

    /** The phone number of the user */
    phoneNumber: string;

    /** The job title of the user */
    jobTitle: string;

    /** The type of the user's account */
    accountType: number;

    /** The classification of the user's account */
    accountClassification: number;
};

export type BookmarkSourceSystem = {
    /** The source system of the bookmark */
    identifier: string;

    /** The name of the source system of the bookmark */
    name: string;

    /** The sub system of the source system of the bookmark */
    subSystem: string;
};

/**
 * Represents a bookmark context reference.
 */
export type BookmarkContext = {
    /** Unique id of the context */
    id: string;

    /** Display name of the context */
    name?: string;

    /** Type of the context */
    type?: string;
};

/**
 * Represents a new bookmark.
 */
export type NewBookmark<T = unknown> = {
    name: string;
    description?: string;
    isShared?: boolean;
    appKey?: string;
    contextId?: string;
    payload: T;
    sourceSystem?: {
        identifier: string;
        name: string;
        subSystem: string;
    };
};

/**
 * Represents a update to a bookmark.
 */
export type PatchBookmark<T = unknown> = Partial<NewBookmark<T>> & Pick<Bookmark, 'id'>;
