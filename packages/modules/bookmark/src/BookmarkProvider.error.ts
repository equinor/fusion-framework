import { type ActionWithSuffix } from '@equinor/fusion-observable';

import { BookmarkActions } from './BookmarkProvider.actions';

export class BookmarkFlowError extends Error {
    constructor(
        message: string,
        public readonly action: ActionWithSuffix<BookmarkActions, 'request'>,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = 'BookmarkProcessError';
    }
}

export class BookmarkProviderError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BookmarkProviderError';
    }
}
