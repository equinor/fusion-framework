import type { BookmarkWithoutData } from '@equinor/fusion-framework-module-bookmark';

export const sortByName = (a: BookmarkWithoutData, b: BookmarkWithoutData) =>
  a.name.localeCompare(b.name);
