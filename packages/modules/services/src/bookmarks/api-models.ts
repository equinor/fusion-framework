import { ApiVersion } from './static';
import { ExtractApiVersion, FilterAllowedApiVersions } from './types';

/**
 * Represents an API bookmark entity with a generic payload type.
 *
 * @template TPayload - The type of the payload data.
 * @property {string} id - The unique identifier of the bookmark.
 * @property {string} name - The name of the bookmark.
 * @property {string} description - The description of the bookmark.
 * @property {boolean} isShared - Indicates whether the bookmark is shared.
 * @property {string} appKey - The application key associated with the bookmark.
 * @property {Context} context - The context information of the bookmark.
 * @property {CreatedBy} createdBy - The information about the user who created the bookmark.
 * @property {UpdatedBy} updatedBy - The information about the user who last updated the bookmark.
 * @property {string} created - The timestamp when the bookmark was created.
 * @property {string} updated - The timestamp when the bookmark was last updated.
 * @property {SourceSystem} sourceSystem - The information about the source system of the bookmark.
 */
type ApiBookmark_v1 = {
    id: string;
    name: string;
    description: string;
    isShared: boolean;
    appKey: string;
    context: ApiBookmark_Context_v1;
    createdBy: ApiBookmark_User_v1;
    updatedBy: ApiBookmark_User_v1;
    created: string;
    updated: string;
    sourceSystem: ApiBookmark_SourceSystem_v1;
    /** @deprecated this should not be in the response, see {@link ApiBookmarkPayload_v1} */
    payload?: string;
};


export type ApiBookmark<TVersion extends FilterAllowedApiVersions> = {
    [ApiVersion.v1]: ApiBookmark_v1;
}[ExtractApiVersion<TVersion>];

/**
 * Represents the payload for an API bookmark.
 *
 * @template TPayload - The type of the payload data.
 * @property {string} id - The unique identifier of the bookmark.
 * @property {TPayload} [payload] - The optional payload data associated with the bookmark.
 * @property {object} [context] - The optional context information for the bookmark.
 * @property {string} [context.id] - The unique identifier of the context.
 * @property {string} [context.name] - The optional name of the context.
 * @property {string} [context.type] - The optional type of the context.
 */
type ApiBookmarkPayload_v1 = {
    id: string;
    payload?: string;
    context?: {
        id: string;
        name?: string;
        type?: string;
    };
};

export type ApiBookmarkPayload<TVersion extends FilterAllowedApiVersions> = {
    [ApiVersion.v1]: ApiBookmarkPayload_v1;
}[ExtractApiVersion<TVersion>];

/**
 * Represents the context of a bookmark, including its unique identifier, name, and type.
 */
type ApiBookmark_Context_v1 = {
    id: string;
    name: string;
    type: string;
};

export type ApiBookmark_Context<TVersion extends FilterAllowedApiVersions> = {
    [ApiVersion.v1]: ApiBookmark_Context_v1;
}[ExtractApiVersion<TVersion>];

/**
 * Represents the user who created a bookmark.
 * @property {string} azureUniqueId - The unique identifier of the user in Azure Active Directory.
 * @property {string} mail - The email address of the user.
 * @property {string} name - The full name of the user.
 * @property {string} phoneNumber - The phone number of the user.
 * @property {string} jobTitle - The job title of the user.
 * @property {number} accountType - The type of the user's account.
 * @property {number} accountClassification - The classification of the user's account.
 */
type ApiBookmark_User_v1 = {
    azureUniqueId: string;
    mail: string;
    name: string;
    phoneNumber: string;
    jobTitle: string;
    accountType: number;
    accountClassification: number;
};

export type ApiBookmark_User<TVersion extends FilterAllowedApiVersions> = {
    [ApiVersion.v1]: ApiBookmark_User_v1;
}[ExtractApiVersion<TVersion>];

/**
 * Represents the source system of a bookmark, including its unique identifier, name, and subsystem.
 * @property {string} identifier - The unique identifier of the source system.
 * @property {string} name - The name of the source system.
 * @property {string} subSystem - The subsystem of the source system.
 */
type ApiBookmark_SourceSystem_v1 = {
    identifier: string;
    name: string;
    subSystem: string;
};

export type ApiBookmark_SourceSystem<TVersion extends FilterAllowedApiVersions> = {
    [ApiVersion.v1]: ApiBookmark_SourceSystem_v1;
}[ExtractApiVersion<TVersion>];
