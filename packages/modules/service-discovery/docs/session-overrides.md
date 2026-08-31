# Session Overrides

> [!TIP]
> Session overrides let you redirect services to local or staging URLs during development without touching application config.

Store a JSON object in `sessionStorage` under the key `"overriddenServiceDiscoveryUrls"`:

```typescript
const overrides = {
  'my-api': {
    url: 'https://localhost:3000/api',
    scopes: ['https://localhost/.default'],
  },
};
sessionStorage.setItem('overriddenServiceDiscoveryUrls', JSON.stringify(overrides));
```

How it works:

1. Services are fetched normally from the API
2. The module checks `sessionStorage` for overrides
3. Matching services get their `uri` and `scopes` replaced, and an `overridden: true` flag is set
4. Overrides are only applied when `sessionStorage` is available

Clear overrides by removing the storage key:

```typescript
sessionStorage.removeItem('overriddenServiceDiscoveryUrls');
```

> [!NOTE]
> Session overrides are temporary — they are cleared when the browser session ends and only affect the current tab/window.
