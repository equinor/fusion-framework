import z from 'zod';

import {
    bookmarkSchema,
    bookmarkSourceSystemSchema,
    bookmarksSchema,
    bookmarkWithDataSchema,
} from './bookmark.schemas';

import { bookmarkConfigSchema } from './bookmark-config.schema';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Bookmark<T extends BookmarkData = any> = z.infer<
    ReturnType<typeof bookmarkWithDataSchema<T>>
>;

/**
 * Represents the configuration options for a bookmark module.
 */
export type BookmarkModuleConfig = z.infer<typeof bookmarkConfigSchema>;
