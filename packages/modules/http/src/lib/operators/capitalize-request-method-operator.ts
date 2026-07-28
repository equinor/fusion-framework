import { requestMethodCasing } from './fetch-request.schemas';
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

    // surface schema validation issues as warnings when not running silently
    if (error && !options?.silent) {
      // one warning per issue so callers can see exactly what failed to validate
      for (const e of error.issues) {
        console.warn(e.message);
      }
    }

    return request;
  };
