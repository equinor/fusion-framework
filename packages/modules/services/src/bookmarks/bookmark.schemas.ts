import { ApiVersion } from './api-version';

import { z } from 'zod';

/** Zod schema that parses an ISO-8601 datetime string into a `Date` object. */
export const ApiDateSchema = z
  .string()
  .datetime({ offset: true })
  .transform((x) => new Date(x));

/** Zod schema for a person reference in a bookmark response. */
export const ApiPersonSchema = {
  [ApiVersion.v1]: z.object({
    azureUniqueId: z.string(),
    name: z.string(),
    mail: z.string().optional(),
    phoneNumber: z.string().optional(),
    jobTitle: z.string().nullish(),
    accountType: z.enum(['Employee', 'Consultant', 'External', 'Application', 'Local']).optional(),
    accountClassification: z.enum(['Unclassified', 'Internal', 'External']).nullish(),
  }),
};

/** Zod schema for the source system of a bookmark. */
export const ApiSourceSystem = {
  [ApiVersion.v1]: z.object({
    identifier: z.string(),
    name: z.string().nullish(),
    subSystem: z.string().nullish(),
  }),
};

/** Zod schema for a Fusion context reference attached to a bookmark. */
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
  get [ApiVersion.v1]() {
    return z.object({
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
      sourceSystem: ApiSourceSystem[ApiVersion.v1].nullish(),
    });
  },
  get [ApiVersion.v2]() {
    return this[ApiVersion.v1];
  },
};

/**
 * Zod schema for the bookmark payload.
 *
 * Accepts a record of key-value pairs, a JSON string, or `undefined`.
 * JSON strings are automatically parsed into objects.
 */
export const ApiBookmarkPayload = {
  get [ApiVersion.v1]() {
    return z
      .record(z.string(), z.unknown())
      .or(z.string())
      .optional()
      .default('')
      .transform((x) => {
        try {
          return typeof x === 'string' ? JSON.parse(x) : x;
        } catch {
          return x;
        }
      });
  },
};
