import type { FetchRequest } from '../client';
import type { ProcessOperator } from './types';

export const requestOperatorHeader =
    <T extends FetchRequest = FetchRequest>(key: string, value: string): ProcessOperator<T> =>
    (request) => {
        const headers = new Headers(request.headers);
        headers.append(key, value);
        return { ...request, headers };
    };

export default requestOperatorHeader;
