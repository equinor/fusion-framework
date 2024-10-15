---
'@equinor/fusion-framework-cli': patch
---

Make `app.config.ts` definition scopes optional by updating the `AppConfigFn` type to use `z.input<typeof ApiAppConfigSchema>`.
