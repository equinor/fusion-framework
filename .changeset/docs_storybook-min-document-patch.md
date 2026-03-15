---
"@equinor/fusion-framework-docs": patch
---

fix: register pnpm security patch for min-document prototype pollution vulnerability

Properly register the min-document security patch with pnpm to ensure the prototype pollution vulnerability fix is applied during installation. This ensures Storybook and other dependencies using min-document are protected against prototype chain manipulation attacks.

- Register `min-document@2.19.2.patch` in `pnpm.patchedDependencies`
- Update SECURITY.md to document the active patch registration
- Patch applies automatically during `pnpm install`
