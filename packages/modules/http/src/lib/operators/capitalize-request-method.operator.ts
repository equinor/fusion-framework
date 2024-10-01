import type { ProcessOperator } from './types';

/**
 * Ensures that the HTTP method of the given request is in uppercase.
 *
 * @param request - The HTTP request object to process.
 * @returns A new request object with the HTTP method in uppercase.
 */
export const capitalizeRequestMethodOperator =
    <T extends RequestInit>(): ProcessOperator<T> =>
    (request): T => {
        const method = request.method?.toUpperCase();
        if (method !== request.method) {
            console.warn(
                [
                    `[request-method-operator]: HTTP method '${request.method}' was converted to uppercase '${method}',`,
                    'see RFC 7231 Section 4.1 for more information.',
                    'https://www.rfc-editor.org/rfc/rfc7231#section-4.1',
                ].join(' '),
            );
        }
        return Object.assign(request, { method });
    };
