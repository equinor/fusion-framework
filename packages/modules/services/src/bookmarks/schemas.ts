import { ApiVersion } from './api-version';

import { z } from 'zod';

export const ApiDateSchema = z
    .string()
    .datetime()
    .transform((x) => new Date(x));

export const ApiPersonSchema = {
    [ApiVersion.v1]: z.object({
        azureUniqueId: z.string(),
        name: z.string(),
        mail: z.string().optional(),
        phoneNumber: z.string().optional(),
        jobTitle: z.string().optional(),
        accountType: z
            .enum(['Employee', 'Consultant', 'External', 'Application', 'Local'])
            .optional(),
        accountClassification: z.enum(['Unclassified', 'Internal', 'External']).optional(),
    }),
};

export const ApiSourceSystem = {
    [ApiVersion.v1]: z.object({
        identifier: z.string(),
        name: z.string().nullish(),
        subSystem: z.string().nullish(),
    }),
};

export const ApiFusionContext = {
    [ApiVersion.v1]: z.object({
        id: z.string(),
        name: z.string().nullish(),
        type: z.string().nullish(),
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
        name: z.string(),
        appKey: z.string(),
        description: z.string().optional(),
        isShared: z.boolean().optional(),
        context: ApiFusionContext[ApiVersion.v1].optional(),
        createdBy: ApiPersonSchema[ApiVersion.v1],
        updatedBy: ApiPersonSchema[ApiVersion.v1].optional(),
        created: ApiDateSchema,
        updated: ApiDateSchema.optional(),
        sourceSystem: ApiSourceSystem[ApiVersion.v1].optional(),
        payload: z
            .string()
            .optional()
            .transform((x) => (x ? (JSON.parse(x) as Record<string, unknown>) : undefined)),
    }),
};
