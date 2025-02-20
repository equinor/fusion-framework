import type { FetchRequest } from '../client';
import type { ProcessOperator } from './types';

/**
 * Creates a process operator that adds a header to the request.
 *
 * @param key - The header key to add.
 * @param value - The header value to add.
 * @returns A process operator that adds the specified header to the request.
 */
export const requestOperatorHeader =
  <T extends FetchRequest = FetchRequest>(key: string, value: string): ProcessOperator<T> =>
  (request) => {
    const headers = new Headers(request.headers);
    headers.append(key, value);
    return { ...request, headers };
  };

export default requestOperatorHeader;
