import z from 'zod';

const ApiApplicationPersonSchema = z.object({
    azureUniqueId: z.string(),
    displayName: z.string(),
    mail: z.string().nullish(),
    upn: z.string().nullish(),
    accountType: z.string(),
    accountClassification: z.string().nullish(),
    isExpired: z.boolean().nullish(),
});

export const ApiApplicationBuildSchema = z.object({
    version: z.string(),
    entryPoint: z.string(),
    tags: z.array(z.string()).nullish(),
    tag: z.enum(['latest', 'preview']).nullish(),
    assetPath: z.string().nullish(),
    configUrl: z.string().nullish(),
    timestamp: z.string().nullish(),
    commitSha: z.string().nullish(),
    githubRepo: z.string().nullish(),
    projectPage: z.string().nullish(),
    allowedExtensions: z.array(z.string()).nullish(),
    uploadedBy: ApiApplicationPersonSchema.nullish(),
});

export const ApiApplicationSchema = z.object({
    appKey: z.string(),
    displayName: z.string(),
    description: z.string(),
    type: z.string(),
    isPinned: z.boolean().nullish(),
    templateSource: z.string().nullish(),
    category: z
        .object({
            id: z.string(),
            name: z.string(),
            displayName: z.string(),
            color: z.string(),
            defaultIcon: z.string(),
            sortOrder: z.number(),
        })
        .nullish(),
    visualization: z
        .object({
            color: z.string().nullish(),
            icon: z.string().nullish(),
            sortOrder: z.number(),
        })
        .nullish(),
    keywords: z.array(z.string()).nullish(),
    admins: z.array(ApiApplicationPersonSchema).nullish(),
    owners: z.array(ApiApplicationPersonSchema).nullish(),
    build: ApiApplicationBuildSchema.nullish(),
});

export default { ApiApplicationPersonSchema, ApiApplicationBuildSchema, ApiApplicationSchema };
