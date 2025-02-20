import { requestMethodCasing } from './fetch-request.schema';
import type { ProcessOperator } from './types';

/**
 * Ensures that the HTTP method of the given request is in uppercase.
 *
 * @param request - The HTTP request object to process.
 * @returns A new request object with the HTTP method in uppercase.
 */
export const capitalizeRequestMethodOperator =
  <T extends RequestInit>(options?: { silent?: boolean }): ProcessOperator<T> =>
  (request): T => {
    const { error, success, data } = requestMethodCasing().safeParse(request.method);

    request.method = success ? data : request.method?.toUpperCase();

    if (error && !options?.silent) {
      error.errors.forEach((e) => console.warn(e.message));
    }

    return request;
  };
