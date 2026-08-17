---
"@equinor/fusion-framework-plugin-context-navigation": minor
---

Add `requireValidContext` option to gate reconciliation on the app's context validation.

When enabled, the reconciler validates the current context against the app's context module (`IContextProvider.validateContext`) before encoding it into the URL. If validation fails, navigation is skipped and an `onContextNavigationSkipped` event is dispatched with reason `invalid-app-context`.

```typescript
enableContextNavigation(configurator, (builder) => {
  builder.setRequireValidContext(true);
});
```

Defaults to `false`, so existing consumers are unaffected unless they opt in.
