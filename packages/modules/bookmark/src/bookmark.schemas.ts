import * as z from 'zod';
import type { Bookmark, BookmarkData } from './types';

/** Zod schema for validating {@link BookmarkUser} objects. */
export const bookmarkUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  mail: z.string().optional(),
});

/** Zod schema for validating {@link SourceSystem} objects on a bookmark. */
export const bookmarkSourceSystemSchema = z.object(
  {
    identifier: z.string(),
    name: z.string().nullish(),
    subSystem: z.string().nullish(),
  },
  { message: 'invalid source system' },
);

/** Zod schema for validating {@link BookmarkContext} objects. */
export const bookmarkContextSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
});

/** Zod schema for validating a {@link BookmarkWithoutData} (no payload). */
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

/** Zod schema for validating an array of bookmarks. */
export const bookmarksSchema = z.array(bookmarkSchema);

/**
 * Creates a Zod schema for a {@link Bookmark} that includes a typed payload field.
 *
 * @template T - The bookmark payload data shape.
 * @template S - Zod schema type for the payload.
 * @param schema - Optional Zod schema to validate the payload. Defaults to
 *   `z.record(z.string(), z.unknown()).or(z.string()).optional()`.
 * @returns A Zod object schema extending {@link bookmarkSchema} with a `payload` property.
 */
export const bookmarkWithDataSchema = <
  T extends BookmarkData = BookmarkData,
  S extends z.ZodSchema<T> = z.ZodSchema<T>,
>(
  schema: S = z.record(z.string(), z.unknown()).or(z.string()).optional() as unknown as S,
) =>
  bookmarkSchema.extend({
    payload: schema,
  });

/**
 * Parses an unknown value into a typed {@link Bookmark} using {@link bookmarkWithDataSchema}.
 *
 * @template T - The bookmark payload data shape.
 * @param value - The raw value to parse.
 * @returns The parsed bookmark object.
 * @throws {ZodError} When validation fails.
 */
export const parseBookmark = <T extends BookmarkData>(value: unknown): Bookmark<T> => {
  return bookmarkWithDataSchema().parse(value) as Bookmark<T>;
};
