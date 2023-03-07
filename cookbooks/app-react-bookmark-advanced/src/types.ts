export interface MyBookmark {
    page: string;
    title: string;
    data: string;
}

export interface BookmarkState {
    name: string;
    description: string;
    isShared: boolean;
    payload: MyBookmark;
}
