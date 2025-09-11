---
"@equinor/fusion-framework-cli": patch
---

Documented missing breaking change for Vite configuration file naming in CLI v11 migration guide and changelog.

- Added detailed explanation of `app.vite.config.ts` → `vite.config.ts` file naming change
- Emphasized that `vite.config.ts` should be a last resort for custom setups
- Recommended using `dev-server.config.js` instead to avoid unexpected behavior
- Updated migration checklist to include the file rename requirement
- Enhanced v11.0.0 changelog with the breaking change documentation

This addresses the undocumented breaking change that could cause time-consuming debugging for developers upgrading from v10 to v11.
