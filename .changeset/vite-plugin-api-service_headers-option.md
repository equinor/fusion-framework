---
"@equinor/fusion-framework-vite-plugin-api-service": minor
---

Add a `headers` plugin option that sets headers on every request the plugin forwards upstream, for both the service discovery proxy and proxy routes. The headers overwrite values with the same name sent by the browser, so upstream services can use them to recognise forwarded traffic.

```typescript
apiServicePlugin({ proxyHandler }, { headers: { 'X-Fusion-CLI-Name': 'my-tool' } });
```

Related: https://github.com/equinor/fusion-core-tasks/issues/2207
