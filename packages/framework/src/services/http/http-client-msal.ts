import { HttpClient, HttpRequestInit } from './http-client';

type RequestInitMsal = HttpRequestInit & { scopes?: string[] };

// TODO - add description
export class HttpClientMsal extends HttpClient<RequestInitMsal> {
    public defaultScope: string[] = [];

    fetch(init: Omit<RequestInitMsal, 'uri'> | string): ReturnType<HttpClient['fetch']> {
        init = typeof init === 'string' ? { path: init } : init;
        Object.assign(init, { scopes: this.defaultScope.concat(init.scopes || []) });
        return super.fetch(init);
    }
}

export default HttpClientMsal;
