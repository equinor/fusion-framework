---
"@equinor/fusion-observable": patch
---

Internal: resolve `noExplicitAny`/`noConfusingVoidType` Biome warnings across action creators, the `Effect`/`Flow` RxJS types, `useDebounce`, `map-prop`, and internal TS helper types. Generic defaults that must remain bivariant `any` (e.g. `TType = any` on `createAction`/`createAsyncAction`) and callback-return `void` unions relying on TypeScript's void-callback leniency are suppressed with explanatory `biome-ignore` comments instead of being loosened to `unknown`/`undefined`, since doing so broke downstream package builds. No public API or behavior change.
