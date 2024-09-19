import z from 'zod';

const ApiApplicationPersonSchema = z.object({
    azureUniqueId: z.string(),
    displayName: z.string().optional(),
    mail: z.string().optional(),
    upn: z.string().optional(),
    accountType: z.string().optional(),
    accountClassification: z.string().optional(),
    isExpired: z.boolean().optional(),
});

export const ApiApplicationBuildSchema = z.object({
    version: z.string().optional(),
    entryPoint: z.string().optional(),
    tags: z.array(z.string()).optional(),
    tag: z.enum(['latest', 'preview']).optional(),
    assetPath: z.string().optional(),
    configUrl: z.string().optional(),
    timestamp: z.string().optional(),
    commitSha: z.string().optional(),
    githubRepo: z.string().optional(),
    projectPage: z.string().optional(),
    uploadedBy: ApiApplicationPersonSchema.optional(),
});

export const ApiApplicationSchema = z.object({
    appKey: z.string(),
    displayName: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    isPinned: z.boolean().optional(),
    templateSource: z.string().optional(),
    category: z
        .object({
            id: z.string(),
            name: z.string().optional(),
            displayName: z.string().optional(),
            color: z.string().optional(),
            defaultIcon: z.string().optional(),
            sortOrder: z.number().optional(),
        })
        .optional(),
    visualization: z
        .object({
            color: z.string().optional(),
            icon: z.string().optional(),
            sortOrder: z.number(),
        })
        .optional(),
    keywords: z.array(z.string()).optional(),
    admins: z.array(ApiApplicationPersonSchema).optional(),
    owners: z.array(ApiApplicationPersonSchema).optional(),
    build: ApiApplicationBuildSchema.optional(),
});

export default { ApiApplicationPersonSchema, ApiApplicationBuildSchema, ApiApplicationSchema };
