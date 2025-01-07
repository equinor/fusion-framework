---
"@equinor/fusion-framework-module-app": patch
---

Added versioning support to `AppModuleProvider`.

**Modified files:**
- `packages/modules/app/src/AppModuleProvider.ts`

**Changes:**
- Imported `SemanticVersion` from `@equinor/fusion-framework-module`.
- Imported `version` from `./version`.
- Added a `version` getter to `AppModuleProvider` that returns a `SemanticVersion` instance.