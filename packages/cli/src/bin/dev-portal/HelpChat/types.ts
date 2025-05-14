import type { z } from 'zod';
import type { ArticleSchema } from './schemas/articleSchema';
import type { FaqSchema } from './schemas/faqSchema';

export type Article = z.infer<typeof ArticleSchema>;
export type FaqArticle = z.infer<typeof FaqSchema>;
