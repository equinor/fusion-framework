---
"@equinor/fusion-framework-module-http": patch
---

When adding operators to request and response handler to an http client instanstance, the values where added to the configured handlers permanently

```ts
// create a new client from configuration
const fooClient = provider.createClient("foo");
fooClient.requestHandler.setHeader("x-foo", "bar");

// generate a RequestInit object
const fooRequest = await lastValueFrom(
  fooClient.requestHandler.process({ path: "/api", uri: fooClient.uri }),
);

expect((fooRequest.headers as Headers)?.get("x-foo")).toBe("bar");

// create a new client from the same configuration
const barClient = provider.createClient("foo");

// generate a RequestInit object
const barRequest = await lastValueFrom(
  barClient.requestHandler.process({ path: "/api", uri: barClient.uri }),
);

// expect the request header to not been modified
// FAILED
expect((barRequest.headers as Headers)?.get("x-foo")).toBeUndefined();
```

modified the `ProcessOperators` to accept operators on creation, which are clone to the instance.

```diff
--- a/packages/modules/http/src/lib/client/client.ts
+++ a/packages/modules/http/src/lib/client/client.ts
constructor(
    public uri: string,
    options?: Partial<HttpClientCreateOptions<TRequest, TResponse>>,
) {
-   this.requestHandler = options?.requestHandler ?? new HttpRequestHandler<TRequest>();
+   this.requestHandler = new HttpRequestHandler<TRequest>(options?.requestHandler);
-   this.responseHandler = options?.responseHandler ?? new HttpResponseHandler<TResponse>();
+   this.responseHandler = new HttpResponseHandler<TResponse>(options?.responseHandler);
    this._init();
}

```
