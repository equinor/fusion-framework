import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export const ArticleSchema = z.object({
  id: z.string().uuid().default(uuid),
  appKey: z.string(),
  slug: z.string().optional(),
  title: z.string(),
  sortOrder: z.number(),
  linkedAppKeys: z.array(z.string()),
  summary: z.string(),
  contentPath: z.string().optional(),
  createdAt: z.nullable(z.string()).optional(),
  createdBy: z
    .object({
      azureUniqueId: z.string().uuid(),
      isExpired: z.boolean(),
    })
    .optional(),
  updatedAt: z.nullable(z.string()).optional(),
  updatedBy: z
    .object({
      azureUniqueId: z.string().uuid(),
      isExpired: z.boolean(),
    })
    .optional(),
  lastModified: z.nullable(z.string()).optional(),
  lastModifiedBy: z
    .object({
      azureUniqueId: z.string().uuid(),
      isExpired: z.boolean(),
    })
    .optional(),
  content: z.string(),
});
