---
"@equinor/fusion-framework-cli": patch

---

Fix: Improve type safety and error handling in `AppAssetExportPlugin` (app-assets plugin).

- Use `unknown as PluginContext` for type casting in `resolveId` and `emitAssetSync` calls.
- Add null check and warning if asset emission fails.
- Minor code style and safety improvements.

This change improves plugin robustness and aligns with best practices for Vite/Rollup plugin development.
