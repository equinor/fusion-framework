---
"@equinor/fusion-framework-module-msal": patch
---

Internal: resolve `noExplicitAny`/`noConfusingVoidType` Biome warnings in `enableMSAL`'s configurator widening and the `onRedirectNavigate` callback types (v2/v4), plus safely tighten interface method return types (`login`/`acquireToken` in `IAuthClient`, `MsalProvider`) from `| void` to `| undefined`. No public API or behavior change.
