import { QueueItem } from './types';

type QueryClientErrorType = 'error' | 'abort';

export class QueryClientError extends Error {
    public readonly request: QueueItem;
    constructor(
        public type: QueryClientErrorType,
        args: { message?: string; cause?: Error | unknown; request: QueueItem }
    ) {
        super(args.message, { cause: args.cause });
        this.request = args.request;
    }
}
