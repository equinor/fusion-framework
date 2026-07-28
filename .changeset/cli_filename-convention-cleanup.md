---
"@equinor/fusion-framework-cli": patch
---

Internal: renamed ~50 source files under `packages/cli/src` to comply with the `filename-convention` lint rule (e.g. `app-build.ts` → `build-application.ts`, `app-config.ts` → `define-app-config.ts`). Also fixed two latent self-import bugs uncovered during the rename (`load-portal-schema.ts` and `load-app-manifest.ts` each importing a type from themselves instead of their sibling module). No public API changes.
