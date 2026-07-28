---
"@equinor/fusion-framework-module": patch
---

Internal: resolve `noExplicitAny` Biome warnings in core module system types (`AnyModule`, `ref` widening, `infer`-position type extraction) with a file-level `biome-ignore-all` explaining why `unknown` is unsatisfiable given `TConfig`/`TType`'s contravariant use elsewhere in the interface. Converts the single-call-signature `FrameworkPlugin` interface to a function type to satisfy `useShorthandFunctionType`. No public API or behavior change.
