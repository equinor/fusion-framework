import { HttpClient, HttpRequestInit } from './http-client';

type RequestInitMsal = HttpRequestInit & { scopes?: string[] };
export class HttpClientMsal extends HttpClient<RequestInitMsal> {
    public defaultScope: string[] = [];

    fetch(init: Omit<RequestInitMsal, 'uri'> | string): ReturnType<HttpClient['fetch']> {
        if (typeof init === 'object') {
            Object.assign(init, { scopes: this.defaultScope.concat(init.scopes || []) });
        }
        return super.fetch(init);
    }
}

export default HttpClientMsal;
