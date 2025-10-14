---
"@equinor/fusion-framework-module-feature-flag": patch
---

Fix FeatureFlagProvider to extend BaseModuleProvider, ensuring proper framework integration and consistent provider lifecycle management.

Provider now correctly implements IModuleProvider interface through BaseModuleProvider inheritance.
