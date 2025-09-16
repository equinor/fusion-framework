---
"@equinor/fusion-framework-module": patch
---

Fixed missing type definitions in compiled declaration files.

- Removed @internal JSDoc tags from ModulesObjectInstanceType and ModulesObjectConfigType
- These utility types are now properly included in the public API since they are referenced by public types
- Resolves TypeScript compilation errors when consuming the module

Fixes #3383
