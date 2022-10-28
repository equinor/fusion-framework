import { IBookmarkModuleConfig } from './configurator';

import { BookmarkClient, BookmarkClientOptions } from './client/BookmarkClient';
import { ApiBookmarkEntityV1 } from './types';
import { ModuleType } from '@equinor/fusion-framework-module';
import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

/**
 * WARNING: this is an initial draft.
 * api clients will most probably not be exposed in future!
 */
export interface IBookmarkProvider<TPayload> {
    /** DANGER */
    readonly bookmarkClient: BookmarkClient<TPayload>;
}

export class BookmarkProvider<TPayload> implements IBookmarkProvider<TPayload> {
    #bookmarkClient: BookmarkClient<TPayload>;

    public get bookmarkClient() {
        return this.#bookmarkClient;
    }

    get currentBookmark(): ApiBookmarkEntityV1<TPayload> | undefined {
        return this.#bookmarkClient.currentBookmark;
    }

    set currentBookmark(bookmark: ApiBookmarkEntityV1<TPayload> | undefined) {
        this.#bookmarkClient.setCurrentBookmark(bookmark);
    }

    constructor(args: { config: IBookmarkModuleConfig; event?: ModuleType<EventModule> }) {
        const { config, event } = args;
        this.#bookmarkClient = new BookmarkClient(
            config.getBookmark as BookmarkClientOptions<TPayload>
        );

        if (event) {
            /** this might be moved to client, to await prevention of event */
            this.#bookmarkClient.currentBookmark$.subscribe((bookmark) => {
                if (bookmark) {
                    event.dispatchEvent('onBookmarkCleared', {
                        canBubble: true,
                        detail: undefined,
                    });
                } else {
                    event.dispatchEvent('onCurrentBookmarkChange', {
                        canBubble: true,
                        detail: { bookmark },
                    });
                }
            });
        }
    }
}

export default BookmarkProvider;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        //Uncertain whether bookmark cleared is an onCurrentBookmarkChange event
        onCurrentBookmarkChange: FrameworkEvent<
            FrameworkEventInit<{
                bookmark: ApiBookmarkEntityV1<unknown> | undefined;
            }>
        >;
        onBookmarkCleared: FrameworkEvent<FrameworkEventInit<undefined>>;
    }
}
