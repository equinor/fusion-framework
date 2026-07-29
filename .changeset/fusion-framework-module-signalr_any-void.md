---
"@equinor/fusion-framework-module-signalr": patch
---

Internal: resolve `noExplicitAny` Biome warnings in `enableSignalR`'s `IModulesConfigurator<any, any>` overloads (via `biome-ignore`), and safely tighten `Topic`'s `send`/`invoke` rest parameters from `any[]` to `unknown[]` since they are only forwarded to the underlying hub connection call. No public API or behavior change.
