import { ApiVersion } from './api-version';

import { z } from 'zod';

export const ApiDateSchema = z
    .string()
    .datetime()
    .transform((x) => new Date(x));

export const ApiPersonSchema = {
    [ApiVersion.v1]: z.object({
        id: z.string(),
        name: z.string(),
        jobTitle: z.string(),
        // [ Employee, Consultant, External, Application, Local ]
        accountType: z.number(),
        // [ Unclassified, Internal, External ]
        accountClassification: z.number(),
    }),
};

export const ApiSourceSystem = {
    [ApiVersion.v1]: z.object({
        identifier: z.string().nullish(),
        name: z.string().nullish(),
        subSystem: z.string().nullish(),
    }),
};

export const ApiFusionContext = {
    [ApiVersion.v1]: z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
    }),
};

/**
 * Defines the schema for the API bookmark entity, which includes various properties such as the unique identifier, name, application key, description, sharing status, context, creator and updater information, creation and update timestamps, and source system details.
 *
 * This schema is defined for the v1 API version, and the properties are validated using the Zod library.
 */
export const ApiBookmarkSchema = {
    [ApiVersion.v1]: z.object({
        id: z.string(),
        name: z.string().nullish(),
        appKey: z.string().nullish(),
        description: z.string().nullish(),
        isShared: z.boolean().nullish(),
        context: ApiFusionContext[ApiVersion.v1].nullish(),
        createdBy: ApiPersonSchema[ApiVersion.v1],
        updatedBy: ApiPersonSchema[ApiVersion.v1].nullish(),
        created: ApiDateSchema,
        updated: ApiDateSchema.nullish(),
        sourceSystem: ApiSourceSystem[ApiVersion.v1].nullish(),
        payload: z
            .string()
            .nullish()
            .transform((x) => (x ? JSON.parse(x) : undefined)),
    }),
};
