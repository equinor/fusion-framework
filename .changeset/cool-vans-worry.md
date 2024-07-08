---
'@equinor/fusion-framework-module': patch
---

`ConfigBuilderCallback` in `BaseConfigBuilder` has now type-guard for only accepting `ObservableInput` as the return type.
The method never supported synchronous return types, but the type-guard was missing.
