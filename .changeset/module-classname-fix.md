---
"@equinor/fusion-framework-module": patch
"@equinor/fusion-framework": patch
"@equinor/fusion-framework-app": patch
---

Internal: Add static className properties to configurator classes (ModulesConfigurator, FrameworkConfigurator, AppConfigurator) to prevent constructor name mangling during compilation and ensure proper event naming.
