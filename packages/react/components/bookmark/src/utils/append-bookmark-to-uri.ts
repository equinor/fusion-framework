export const appendBookmarkIdToUrl = (id: string): string => {
    const url = new URL(window.location.toString());
    url.searchParams.set('bookmarkId', id);
    return url.toString();
};
