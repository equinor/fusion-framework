---
"@equinor/fusion-framework-module-msal": minor
---

Move the MSAL configuration schema into `MsalConfig.schema.ts` and add `MsalConfigExtension`, an extension point for variants of this module.

`MsalConfig` is now the schema's inferred type intersected with `MsalConfigExtension`, an empty interface a variant merges its own configuration into:

```typescript
declare module '@equinor/fusion-framework-module-msal' {
  interface MsalConfigExtension {
    mock?: { account?: MsalMockUser };
  }
}
```

`BaseConfigBuilder._set` derives its target from `MsalConfig`, so before this a key the type did not know about could only be set by casting past the builder. Making the configurator generic over its configuration cannot solve that: a dot-path union over an unresolved type parameter defers, which takes every existing literal path down with it.

The schema is unchanged and still describes exactly what reaches `MsalProvider` — it strips anything merged in, so an extension carries a declaration across the builder and stops there. `MsalConfigSchema`, `TelemetryConfigSchema` and their types are re-exported from `MsalConfigurator` as before.
