enum RequestErrorType {
    ERROR = 'error',
    ABORT = 'abort',
}

export class QueryError extends Error {
    static TYPE = RequestErrorType;
    constructor(public type: RequestErrorType, message?: string, public cause?: Error) {
        super(message, { cause: cause });
    }
}
