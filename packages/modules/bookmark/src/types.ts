import z from 'zod';

import { bookmarkSchema, bookmarksSchema, bookmarkWithDataSchema } from './schemas';

export type BookmarkData = Record<string, unknown>;

export type Bookmarks = z.infer<typeof bookmarksSchema>;

export type BookmarkWithoutData = z.infer<typeof bookmarkSchema>;

export type Bookmark<T extends BookmarkData = BookmarkData> = z.infer<
    ReturnType<typeof bookmarkWithDataSchema<T>>
>;
