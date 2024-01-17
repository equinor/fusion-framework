import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { Observable } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';
import { Query } from '@equinor/fusion-query';
import { switchMap, map, catchError, EMPTY, last } from 'rxjs';
import { GetAllBookmarksParameters, Bookmark } from '../types';
import { actions, Actions } from './bookmarkActions';

export const handleBookmarkGetAll =
    (
        queryAllBookmarks: Query<Array<Bookmark<unknown>>, GetAllBookmarksParameters>,
        sourceSystemIdentifier?: string,
    ) =>
    (action$: Observable<Actions>) =>
        action$.pipe(
            filterAction(actions.getAll.type),
            switchMap((action) => {
                return queryAllBookmarks.query({ isValid: action.payload }).pipe(
                    last(),
                    map((bookmarks) =>
                        actions.getAll.success(
                            bookmarks.value.filter(
                                (bookmark) =>
                                    bookmark.sourceSystem?.identifier === sourceSystemIdentifier,
                            ),
                        ),
                    ),
                    catchError(() => EMPTY),
                );
            }),
        );

export const handleCreateBookmark =
    (apiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>) =>
    (action$: Observable<Actions>) =>
        action$.pipe(
            filterAction(actions.create.type),
            switchMap(async (action) => {
                const response = await apiClient.post('v1', action.payload);
                return actions.create.success(await response.json());
            }),
        );

export const handleUpdateBookmark =
    (apiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>) =>
    (action$: Observable<Actions>) =>
        action$.pipe(
            filterAction(actions.update.type),
            switchMap(async (action) => {
                // Should payload be partial? then api client wil need to change.
                const response = await apiClient.patch('v1', action.payload);
                return actions.update.success(await response.json());
            }),
        );

export const handleDeleteBookmark =
    (apiClient: BookmarksApiClient<'fetch', IHttpClient, unknown>) =>
    (action$: Observable<Actions>) =>
        action$.pipe(
            filterAction(actions.delete.type),
            switchMap(async (action) => {
                const response = await apiClient.delete('v1', { id: action.payload });
                if (response.ok) return actions.delete.success(action.payload);
                return actions.delete.success(action.payload);
            }),
        );
