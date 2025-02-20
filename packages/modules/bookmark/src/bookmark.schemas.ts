import * as z from 'zod';
import { BookmarkData } from './types';

export const bookmarkUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  mail: z.string().optional(),
});

export const bookmarkSourceSystemSchema = z.object(
  {
    identifier: z.string(),
    name: z.string().nullish(),
    subSystem: z.string().nullish(),
  },
  { message: 'invalid source system' },
);

export const bookmarkContextSchema = z.object({
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
  sourceSystem: bookmarkSourceSystemSchema.nullish(),
});

export const bookmarksSchema = z.array(bookmarkSchema);

export const bookmarkWithDataSchema = <
  T extends BookmarkData = BookmarkData,
  S extends z.ZodSchema<T> = z.ZodSchema<T>,
>(
  schema: S = z.record(z.unknown()).or(z.string()).optional() as unknown as S,
) =>
  bookmarkSchema.extend({
    payload: schema,
  });
