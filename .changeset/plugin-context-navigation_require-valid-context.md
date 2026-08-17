---
"@equinor/fusion-framework-plugin-context-navigation": major
---

Add `requireValidContext` option to gate reconciliation on the app's context validation.

When enabled, the reconciler and URL guard validate the current context against the app's context module (`IContextProvider.validateContext`) before encoding it into the URL. If validation fails, navigation is skipped and an `onContextNavigationSkipped` event is dispatched with reason `invalid-app-context`.

```typescript
enableContextNavigation(configurator, (builder) => {
  builder.setRequireValidContext(true);
});
```

Defaults to `false`, so existing consumers are unaffected unless they opt in.

**Breaking change:** `ContextNavigationSkippedDetail['reason']` gains a new member, `'invalid-app-context'`. Consumers with an exhaustive `switch` or `assertNever` over this union must add a case for it (or a `default` branch) before upgrading.

```typescript
switch (detail.reason) {
  case 'url-matches':
  case 'no-context':
  case 'no-adapter':
  case 'encode-returned-null':
  case 'canceled':
    // ...
    break;
  case 'invalid-app-context': // new — add this case
    // ...
    break;
}
```

