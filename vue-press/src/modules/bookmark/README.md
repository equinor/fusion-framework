---
title: Bookmark Module
category: Module
tag:
    - bookmark
---

 <ModuleBadge module="modules/bookmark" />
 
 __React__
 <ModuleBadge module="react/modules/bookmark" />
 
 ## Concept

Bookmarks are used to save the state of an application at a specific point in time, so that users can easily return to that state later. A bookmark is for any application, as long that it has been enabled in the given environment. The bookmark module is created to orchestrate this behavior.

```mermaid
  sequenceDiagram

    participant P as Portal
    participant BM as Bookmark Module
    participant BS as Bookmark Service
    participant A as App

    Note over BM: Get bookmarkId from url
    BM->>+BS: Fetch bookmark metadata from service
    BS->>-BM: Resolve bookmark form service
    Note over BM: Set currenBookmark
    BM->>+P: onBookmarkChange
    Note over P: Check if navigation is needed?
    Note over P: Check if current context is bookmark context?
    P->>-A: Portal navigates to application specified by bookmark if needed.
    Note over A: Application navigates to internal page
    Note over A: Application sets bookmark state

```

## Configuration

```ts
import { enableContext } from '@equinor/fusion-framework-module-bookmark';
export const configure = (configurator) => {
    // Some portal configuration
    enableBookmark(configurator, (builder) => {
        builder.setSourceSystem({
            subSystem: 'fusion',
            identifier: 'fusion-classic',
            name: 'Fusion Classic',
        });
    });
    // more configuration...
};
```

## BookmarkProvider

The public properties of the class are:

-   bookmarkClient: an instance of the BookmarkClient class, which is used to interact with the bookmarks API.
-   currentBookmark: the currently selected bookmark.
-   bookmarks$: an observable stream of all bookmarks.
-   currentBookmark$: an observable stream of the current bookmark.

BookmarkProvider has several public methods:

### Public Functions

#### addStateCreator

The state creator is used to collect the state stored in a bookmark. and by adding a creator will enable the bookmark functionality for an application this is used.
cb - For creating the bookmark payload, this should ne wrapped in a useCallback, payload return can be a partial.

```ts
addStateCreator(cb: CreateBookmarkFn<TData>, key?: keyof TData): VoidFunction
```

#### getAllBookmarks / getAllBookmarksAsync

Function for resolving all bookmarks for the current sub system.

::: code-tabs
@tab Async

```ts
getAllBookmarksAsync(): Promise<Array<Bookmark>>;
```

@tab Observable

```ts
getAllBookmarks(): Observable<Array<Bookmark>>;
```

:::

#### createBookmark

Creates a new bookmark with the given arguments, and utilizes teh provided stateCreator to create the bookmark payload.

```ts
createBookmark<T>(args: { name: string; description: string; isShared: boolean }): Promise<Bookmark<T>>:
```

#### getBookmarkById

Function for resolving a bookmark and the bookmarks payload.

```ts
getBookmarkById<T>(bookmarkId: string): Promise<Bookmark<T>>;
```

#### updateBookmark / updateBookmarkAsync

Function for updating bookmark a bookmark when successful this will update the bookmark list.

::: code-tabs

@tab Async

```ts
 updateBookmarkAsync<T>(bookmark: PatchBookmark<T>, options: UpdateBookmarkOptions): Promise<Bookmark<T> | undefined>;
```

@tab Observable

```ts
updateBookmark<T>(bookmark: Bookmark<T>): Observable<Bookmark<T>>;
```

:::

#### deleteBookmarkById / deleteBookmarkByIdAsync

Function for deleting a bookmark by the given identification,
When successful this will update the bookmark list automatically.

::: code-tabs

@tab Async

```ts
    deleteBookmarkByIdAsync(bookmarkId: string): Promise<string>;
```

@tab Observable

```TS
    deleteBookmarkById(bookmarkId: string): Observable<string>;
```

:::

#### setCurrentBookmark

Function for setting the current bookmark, when successful this will update the bookmark list.

If not provided the current bookmark state will be set to undefined.

```ts
setCurrentBookmark<TData>(idOrItem?: string | Bookmark<TData>): void;
```

#### addBookmarkFavoriteAsync

A bookmark can be sheared with other users, when reserving a sheared bookmark this can be added to you collection of bookmarks.
Function for adding external bookmark to users bookmarks .

```ts
addBookmarkFavoriteAsync(bookmarkId: string): Promise<void>;
```

#### removeBookmarkFavoriteAsync

Function for removing external bookmark to user's bookmarks.

```ts
removeBookmarkFavoriteAsync(bookmarkId: string): Promise<void>;
```

#### verifyBookmarkFavoriteAsync

Function for verifying that a bookmark belongs to the current user.

```ts
verifyBookmarkFavoriteAsync(bookmarkId: string): Promise<boolean>;
```

#### dispose

disposes of the class and unsubscribes all subscriptions.

```ts
dispose(): void:
```

### Configuration Options

#### setSourceSystem

This will sett the SourceSystem used when creating a new bookmark, used as the identifier frr the current client. Only used in app shell / portal configuration.

> @param {SourceSystem} sourceSystem
>
> ```ts
> interface SourceSystem {
>     identifier: string;
>     name: string;
>     subSystem: string;
> }
> ```

```ts
enableBookmark(configurator, (builder) => {
    builder.setSourceSystem({
        subSystem: 'fusion',
        identifier: 'fusion-classic',
        name: 'Fusion Classic',
    });
});
```

#### setBookmarkIdResolver

Used to over write the default Url id resolving.

> @param {(() => string | null)} fn - Resolver for bookmarkId

```ts
    enableBookmark(configurator, (builder) => {
        builder.setBookmarkIdResolver(()=>{
            const params = new URLSearchParams(document.location.search);
            return params.get("bookmarkId");
        });
```

#### setCurrentAppIdResolver

```ts
    enableBookmark(configurator, (builder) => {
        const appModule = await builder.requireInstance('app')
        builder.setCurrentAppIdResolver(()=> appModule.current?.appKey);
```

#### setEventProvider

```ts
    enableBookmark(configurator, async (builder) => {
        const event = await builder.requireInstance('event')
        builder.setEventProvider(event);
    }
```

#### setCurrentAppStateCreator

```ts
    enableBookmark(configurator, (builder) => {
        const appProvider = await builder.requireInstance('app')

        builder.setCurrentAppStateCreator(()=> {
            if (!appProvider.current) return;

                const currentAppBookmarkProvider = (
                    appModule.current.instance as AppModulesInstance<[BookmarkModule]>
                ).bookmark;

            return currentAppBookmarkProvider.bookmarkCreators
        });
```

#### setContextIdResolver

Used to over withe the default context id resolver.

> param {(() => string | undefined)} fn - Function for providing current contextId

```ts
    enableBookmark(configurator, async (builder) => {
        const contextProvider = await builder.requireInstance('context')
        builder.setContextIdResolver(()=> {
           return contextProvider.currentContext?.id;
        } );
```

#### setBookmarkQueryClient

Use for override the bookmark query client.

```ts
export const configure = (configurator) => {
    enableBookmark(configurator, (builder) => {

        builder.setBookmarkQueryClient({
            getAllBookmarks: {
                                key: () => 'all-bookmarks',
                                client: {
                                    fn: client.getAllBookmarks,
                                },
                                validate: ({ args }) => args.isValid,
                            }
             getBookmarkById: {
                                key: ({ id }) => id,
                                client: {
                                    fn: client.getBookmarkById,
                                },
                                expire: 60000,
                            }

    }, 0 );
};
```
