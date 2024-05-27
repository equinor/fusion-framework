---
'@equinor/fusion-framework-cli': minor
---

**@equinor/fusion-framework-cli**

Updated the `http-proxy-middleware` dependency from version 2.0.6 to 3.0.0.

Updated the `createDevProxy` function in `packages/cli/src/bin/dev-proxy.ts` to use the new `on` option for `createProxyMiddleware` from `http-proxy-middleware` instead of directly attaching event handlers to the `proxyReq` object.

**Details**

The `http-proxy-middleware` library changed its API to use an `on` option for attaching event handlers to the proxy middleware. This change updates our code to match the new API.

Before:

```ts
createProxyMiddleware('/_discovery/environments/current', {
  ...proxyOptions,
  onProxyReq: (proxyReq) => {
    // ...
  },
  onProxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
    // ...
  }),
}),
```

After:

```ts
createProxyMiddleware({
  ...proxyOptions,
  pathFilter: '/_discovery/environments/current',
  on: {
    proxyReq: (proxyReq) => {
      // ...
    },
    proxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
      // ...
    }),
  },
}),
```

**Migration**

No changes are needed in your code. This is an internal implementation detail of the @equinor/fusion-framework-cli package.

