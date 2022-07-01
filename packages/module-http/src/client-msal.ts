import type { Observable } from 'rxjs';
import { HttpClient, FetchRequestInit, FetchRequest } from './client';

/** Extends request init with scope  */
type MsalFetchRequest = FetchRequest & { scopes?: string[] };
type MsalFetchRequestInit<
    TReturn = unknown,
    TRequest = FetchRequest,
    TResponse = Response
> = FetchRequestInit<TReturn, TRequest, TResponse> & Pick<MsalFetchRequest, 'scopes'>;

/** Default Client for MSAL */
export class HttpClientMsal<
    TRequest extends MsalFetchRequest = MsalFetchRequest,
    TResponse = Response
> extends HttpClient<TRequest, TResponse> {
    /** Scope that will be applied to all request if no scope is provided in request object */
    public defaultScopes: string[] = [];

    /** @inheritdoc */
    fetch<T = TResponse>(
        path: string,
        init?: MsalFetchRequestInit<T, TRequest, TResponse>
    ): Observable<T> {
        const args = Object.assign(init || {}, {
            scopes: this.defaultScopes.concat(init?.scopes || []),
        }) as FetchRequestInit<T, TRequest, TResponse>;
        return super._fetch(path, args);
    }
}

export default HttpClientMsal;
