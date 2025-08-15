import type z from 'zod';

import type {
  bookmarkContextSchema,
  bookmarkSchema,
  bookmarkSourceSystemSchema,
  bookmarksSchema,
  bookmarkUserSchema,
} from './bookmark.schemas';

import type { bookmarkConfigSchema } from './bookmark-config.schema';

/**
 * Represents the source system for a bookmark.
 */
export type SourceSystem = z.infer<typeof bookmarkSourceSystemSchema>;

/**
 * Represents the data associated with a bookmark.
 * This is a generic type that can hold any arbitrary data as a key-value map.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BookmarkData = Record<string, any> | string;

/**
 * Represents a collection of bookmarks.
 */
export type Bookmarks = z.infer<typeof bookmarksSchema>;

/**
 * Represents a bookmark without any associated data.
 */
export type BookmarkWithoutData = z.infer<typeof bookmarkSchema>;

/**
 * Represents a bookmark with associated data.
 * @template T - The type of the bookmark data.
 */
// biome-ignore lint/suspicious/noExplicitAny: must be any to support all bookmark data types
export type Bookmark<T extends BookmarkData = any> = BookmarkWithoutData & {
  payload?: T;
};

/**
 * Represents the configuration options for a bookmark module.
 */
export type BookmarkModuleConfig = z.infer<typeof bookmarkConfigSchema>;

/**
 * Represents a user associated with a bookmark.
 */
export type BookmarkUser = z.infer<typeof bookmarkUserSchema>;

/**
 * Represents the context associated with a bookmark.
 */
export type bookmarkContext = z.infer<typeof bookmarkContextSchema>;
