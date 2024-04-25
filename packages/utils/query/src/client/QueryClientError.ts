import { QueryClientRequest } from './types';

type QueryClientErrorType = 'error' | 'abort';

/**
 * Represents an error that occurs within the query client. This error class is used
 * to encapsulate errors related to query client requests, allowing consumers to handle
 * them in a unified way.
 *
 * The error can be of two types: 'error' for standard errors, and 'abort' for errors
 * resulting from aborted requests. Consumers can distinguish between these by checking
 * the `type` property.
 *
 * To get the actual error that caused this `QueryClientError`, you can access the `cause`
 * property of the instance. This property will contain the original error, if any, that
 * triggered this `QueryClientError`.
 *
 * Example usage:
 * ```
 * try {
 *   // code that may throw a QueryClientError
 * } catch (error) {
 *   if (error instanceof QueryClientError) {
 *     console.log(error.message); // Access the message
 *     if (error.cause) {
 *       console.error(error.cause); // Access the original error
 *     }
 *   }
 * }
 * ```
 */
export class QueryClientError<TArgs = unknown> extends Error {
    public readonly request?: QueryClientRequest;
    constructor(
        public type: QueryClientErrorType,
        args: {
            message: string;
            cause?: Error | unknown;
            request?: QueryClientRequest<TArgs>;
        },
    ) {
        super(args.message, { cause: args.cause });
        this.name = 'QueryClientError';
        this.request = args.request;
    }
}
