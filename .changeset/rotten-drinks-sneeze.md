---
'@equinor/fusion-framework-module-http': minor
---

**@equinor/fusion-framework-module-http**

`HttpClient._resolveUrl` now supports resolving URLs with a base URL that contains a path.

before:

```typescript
const client = new HttpClient('https://example.com/test/me');
client.fetch('/api'); // https://example.com/api
```

now:

```typescript
const client = new HttpClient('https://example.com/test/me');
client.fetch('/api'); // https://example.com/test/me/api
```
