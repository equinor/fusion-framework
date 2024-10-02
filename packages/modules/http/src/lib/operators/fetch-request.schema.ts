import { z } from 'zod';

/**
 * Validates that the provided HTTP method string is in uppercase.
 *
 * @link https://www.rfc-editor.org/rfc/rfc7231#section-4.1
 */
export const requestMethodCasing = (): z.ZodType<string> => {
    return z.custom<string>(
        (value?: string) => value === value?.toUpperCase(),
        (value: string) => ({
            code: z.ZodIssueCode.custom,
            validation: 'uppercase',
            path: ['method'],
            message: [
                `Provided HTTP method '${value}' must be in uppercase.`,
                'See RFC 7231 Section 4.1 for more information',
                'https://www.rfc-editor.org/rfc/rfc7231#section-4.1',
            ].join(' '),
        }),
    );
};

/**
 * Creates a Zod enum schema for HTTP request methods.
 *
 * The schema validates that the value is one of the standard HTTP methods:
 * 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'.
 *
 * If the validation fails, a custom error message is returned, indicating the
 * expected methods and the received value. The error message also references
 * RFC 2616 for more information.
 *
 * @link https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
 */
export const requestMethodVerb = () => {
    return z.enum(
        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'],
        {
            errorMap: (error) => {
                const { received, options } = error as z.ZodInvalidEnumValueIssue;
                return {
                    message: [
                        'Invalid request method.',
                        `Expected '${options.join(' | ')}', but received '${received}'.`,
                        'See RFC 2615 Section 9 for more information',
                        'https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html',
                    ].join(' '),
                };
            },
        },
    );
};

export const requestMethod = () => requestMethodCasing().pipe(requestMethodVerb());

/**
 * Schema for validating the initialization options of a request.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *
 * This schema is used to ensure that the request options conform to the expected structure and types.
 */
export const requestInitSchema = z.object({
    attributionReporting: z
        .object({
            eventSourceEligible: z.boolean().optional(),
            triggerEligible: z.boolean().optional(),
        })
        .optional(),
    body: z
        .union([
            z.string(),
            z.instanceof(Blob),
            z.instanceof(ArrayBuffer),
            z.instanceof(FormData),
            z.instanceof(URLSearchParams),
            z.instanceof(ReadableStream),
        ])
        .optional(),
    browsingTopics: z.boolean().optional(),
    cache: z
        .enum(['default', 'no-store', 'reload', 'no-cache', 'force-cache', 'only-if-cached'])
        .optional(),
    credentials: z.enum(['omit', 'same-origin', 'include']).optional(),
    headers: z.record(z.string(), z.string()).optional().or(z.instanceof(Headers)),
    integrity: z.string().optional(),
    keepalive: z.boolean().optional(),
    method: requestMethod().optional(),
    mode: z.enum(['same-origin', 'cors', 'no-cors', 'navigate', 'websocket']).optional(),
    priority: z.enum(['low', 'high', 'auto']).optional(),
    redirect: z.enum(['follow', 'error', 'manual']).optional(),
    referrer: z.string().optional(),
    referrerPolicy: z
        .enum([
            'no-referrer',
            'no-referrer-when-downgrade',
            'origin',
            'origin-when-cross-origin',
            'same-origin',
            'strict-origin',
            'strict-origin-when-cross-origin',
            'unsafe-url',
        ])
        .optional(),
    signal: z.instanceof(AbortSignal).optional(),
});

/**
 * Schema for validating fetch request configurations.
 *
 * This schema extends the `requestInitSchema` and adds additional properties:
 * - `uri`: A required string representing the URI of the request.
 * - `path`: An optional string representing the path of the request.
 */
export const fetchRequestSchema = requestInitSchema.extend({
    uri: z.string(),
    path: z.string().optional(),
});
