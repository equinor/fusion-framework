---
"@equinor/fusion-framework-dev-server": minor
---

Identify dev-server traffic upstream: every request the dev server proxies (service discovery and `/@fusion-api/*` routes) now carries `X-Fusion-Dev-Server-Name` and `X-Fusion-Dev-Server-Version`, so service owners can tell local development and Playwright traffic apart in their telemetry.

Add more headers with the new `api.headers` option:

```ts
createDevServer({
  api: {
    serviceDiscoveryUrl: 'https://discovery.example.com',
    headers: { 'X-Fusion-Mock': 'false' },
  },
});
```
