import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { ArticleSchema } from './articleSchema';

export const FaqSchema = z.object({
  id: z.string().uuid().default(uuid),
  appKey: z.string(),
  slug: z.string().optional(),
  question: z.string(),
  sortOrder: z.number(),
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
  answer: z.string(),
  linkedArticle: ArticleSchema.optional(),
});
