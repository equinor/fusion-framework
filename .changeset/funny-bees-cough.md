---
"@equinor/fusion-framework-module-app": minor
"@equinor/fusion-framework-app": minor
---

Add possibility to configure and override service-discovery in AppConfig.

Allows developers to define overrides in `app.config.[ENV].ts`:

```typescript
export default defineAppConfig(() => ({
  endpoints: {
    admin: {
      url: "MY_OVERRIDDEN_URL", // e.g. an url to a PR-environment
      scopes: [],
    },
  },
}));
```
