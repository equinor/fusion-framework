const BOOKMARK_SEARCH_PARAM = 'bookmarkId';

export function removeBookmarkIdFromURL(): void {
    const params = new URLSearchParams(document.location.search);
    params.delete(BOOKMARK_SEARCH_PARAM);

    document.location.search = params.toString();
}

export const getBookmarkIdFormURL = (): string | null => {
    const params = new URLSearchParams(document.location.search);
    return params.get(BOOKMARK_SEARCH_PARAM);
};
