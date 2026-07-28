---
"@equinor/fusion-framework-cli": patch
---

Internal: resolve `noConfusingVoidType` Biome warnings on `AppConfigFn`, `FusionCliConfigFn`, `PortalConfigFn`, and `PortalManifestFn`'s callback return-type unions, using explanatory `biome-ignore` comments since the `| void` relies on TypeScript's void-callback leniency. No public API or behavior change.
