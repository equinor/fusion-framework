---
"@equinor/fusion-framework-vite-plugin-api-service": minor
---

Add a `headers` plugin option that adds headers to every proxied upstream request — the service discovery proxy and all proxy routes. A route's own `proxy.headers` take precedence.

```ts
apiServicePlugin({ proxyHandler }, { headers: { 'X-Fusion-Dev-Server-Version': '2.3.0' } });
```
