---
"@equinor/fusion-framework-module-context": major
---

Remove `routingStrategy` from the context module.

The URL routing strategy (`query` or `path`) is now declared in the app manifest's `build.options.contextRouting` field and read by the `@equinor/fusion-framework-plugin-context-navigation` plugin at the portal level. This removes coupling between the context module and URL encoding concerns.

**Breaking changes:**

- Removed `ContextRoutingStrategy` type.
- Removed `routingStrategy` from `ContextModuleConfig` and `IContextProvider`.
- Removed `setRoutingStrategy()` from `ContextConfigBuilder`.
- Removed the third `routingStrategy` parameter from `generatePathFromContext`.
- Removed the console warning about missing routing strategy during `createConfig`.

**Migration:** Apps that previously called `builder.setRoutingStrategy('query')` or `builder.setRoutingStrategy('path')` should remove that call and instead declare `contextRouting` in their app manifest's `build.options`:

```json
{
  "build": {
    "options": {
      "contextRouting": "query"
    }
  }
}
```

Apps with custom URL shapes (`setContextPathExtractor` / `setContextPathGenerator`) continue to work unchanged — the custom adapter picks up those hooks automatically.
