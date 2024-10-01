import { z } from 'zod';
import type { ProcessOperator } from './types';
import type { FetchRequest } from '../client/types';

/**
 * Schema for validating the initialization options of a request.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *
 * This schema is used to ensure that the request options conform to the expected structure and types.
 */
const requestInitSchema = z.object({
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
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
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

const fetchRequestSchema = requestInitSchema.extend({
    uri: z.string(),
    path: z.string().optional(),
});

/**
 * Validates the given request using the `requestInitSchema`.
 *
 * By default, the validation is not strict, meaning that additional properties
 * not defined in the schema will be allowed and passed through without causing validation errors.
 * Also the operator will not modify the request object, it will only log an error message if the validation fails.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
 *
 * @param request - The request object to be validated.
 * @returns The validated request object if validation is successful.
 * @throws Will log an error message if the request validation fails.
 */
export const requestValidationOperator =
    <T extends FetchRequest>(options?: {
        /**
         * When set to true, the validation will be strict, meaning that any additional properties
         * not defined in the schema will cause the validation to fail. If set to false or omitted,
         * additional properties will be allowed and passed through without causing validation errors.
         */
        strict?: boolean;
        /**
         * When enabled, the function will return the parsed result.
         * This means that if the request object passes validation,
         * the parsed and potentially transformed request object will be returned.
         * If this option is not enabled, the function will not return anything
         * even if the request object is valid.
         */
        parse?: boolean;
    }): ProcessOperator<T> =>
    (request) => {
        const { strict, parse } = options ?? {};
        const schema = strict ? fetchRequestSchema : fetchRequestSchema.passthrough();
        try {
            const result = schema.parse(request) as T;
            return parse ? result : void 0;
        } catch (error) {
            console.error('Invalid request options', (error as z.ZodError).message);
        }
    };
