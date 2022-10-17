export class QueryClientError extends Error {
    constructor(public type: 'error' | 'abort', message?: string, public cause?: Error) {
        super(message);
    }
}
