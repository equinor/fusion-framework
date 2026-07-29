---
"@equinor/fusion-framework": patch
---

Internal: resolve `noExplicitAny` Biome warning on `FrameworkConfigurator`'s `TRef` generic default with an explanatory `biome-ignore` comment (the default must remain bivariant `any`). No public API or behavior change.
