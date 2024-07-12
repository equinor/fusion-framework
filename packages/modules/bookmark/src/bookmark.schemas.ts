import * as z from 'zod';

const bookmarkUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    jobTitle: z.string(),
    accountType: z.enum(['Employee', 'Consultant', 'External', 'Application', 'Local']),
    accountClassification: z.enum(['Unclassified', 'Internal', 'External']),
});

export const bookmarkSourceSystemSchema = z.object({
    identifier: z.string(),
    name: z.string().optional(),
    subSystem: z.string().optional(),
});

const bookmarkContextSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
});

export const bookmarkSchema = z.object({
    id: z.string(),
    name: z.string(),
    appKey: z.string(),
    description: z.string().optional(),
    isShared: z.boolean().optional(),
    created: z.date(),
    createdBy: bookmarkUserSchema,
    updated: z.date().optional(),
    updatedBy: bookmarkUserSchema.optional(),
    context: bookmarkContextSchema.optional(),
    sourceSystem: bookmarkSourceSystemSchema.optional(),
});

export const bookmarksSchema = z.array(bookmarkSchema);

export const bookmarkWithDataSchema = <
    T extends Record<string, unknown>,
    S extends z.ZodSchema<T> = z.ZodSchema<T>,
>(
    schema: S = z.record(z.unknown()).default({}) as unknown as S,
) =>
    bookmarkSchema.extend({
        payload: schema,
    });
